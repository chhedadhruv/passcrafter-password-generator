// CSV import/export compatible with Chrome, Bitwarden and 1Password column layouts.

export const MAX_CSV_BYTES = 5 * 1024 * 1024;
export const EXPORT_HEADER = ["name", "url", "username", "password", "note"];

/** RFC 4180 parser: quoted fields, escaped quotes, newlines inside quotes, CRLF, BOM. */
export function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

const HEADER_ALIASES = {
  label: ["name", "title", "label"],
  site: ["url", "login_uri", "website", "web site", "site"],
  username: ["username", "login_username", "user", "login"],
  password: ["password", "login_password", "pass"],
  notes: ["note", "notes"],
};

/** Convert parsed CSV rows into vault entries by matching header names. */
export function csvToEntries(rows) {
  if (rows.length < 2) return { entries: [], error: "The file has no data rows." };
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const index = {};
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    const i = header.findIndex((h) => aliases.includes(h));
    if (i !== -1) index[field] = i;
  }
  if (index.password === undefined) {
    return { entries: [], error: "No password column found. Expected a header like name,url,username,password,note." };
  }
  const entries = rows.slice(1).map((r) => {
    const get = (f) => (index[f] === undefined ? "" : r[index[f]] ?? "");
    return {
      label: stripGuard(get("label")),
      site: stripGuard(get("site")),
      username: stripGuard(get("username")),
      password: get("password"), // never altered
      notes: stripGuard(get("notes")),
    };
  });
  return { entries, error: null };
}

// Cells starting with these can run as formulas when a CSV is opened in a spreadsheet.
const DANGEROUS = /^[=+\-@\t\r]/;

function guard(value) {
  return DANGEROUS.test(value) ? "'" + value : value;
}

/** Undo the guard we add on export so a round trip is lossless. */
function stripGuard(value) {
  return /^'[=+\-@\t\r]/.test(value) ? value.slice(1) : value;
}

function quote(value) {
  return /[",\r\n]/.test(value) ? '"' + value.replace(/"/g, '""') + '"' : value;
}

/**
 * Serialize entries to Chrome-style CSV. Text columns are guarded against spreadsheet
 * formula injection; the password column is written exactly as stored so passwords
 * starting with "-", "+", "=" or "@" are not corrupted.
 */
export function entriesToCsv(entries) {
  const lines = [EXPORT_HEADER.join(",")];
  for (const e of entries) {
    lines.push(
      [
        quote(guard(e.label || "")),
        quote(guard(e.site || "")),
        quote(guard(e.username || "")),
        quote(e.password || ""),
        quote(guard(e.notes || "")),
      ].join(",")
    );
  }
  return lines.join("\r\n") + "\r\n";
}
