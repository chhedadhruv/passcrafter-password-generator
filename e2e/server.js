// Minimal static file server for the exported site (out/), so the suites need no extra tooling.
const fs = require("fs");
const http = require("http");
const path = require("path");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".map": "application/json",
};

function start(root) {
  const base = path.resolve(root);

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      res.writeHead(400).end("Bad request");
      return;
    }

    let file = path.join(base, pathname);
    if (file !== base && !file.startsWith(base + path.sep)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    try {
      if (fs.statSync(file).isDirectory()) {
        // Same behaviour as the production host: directories need a trailing slash.
        if (!pathname.endsWith("/")) {
          res.writeHead(301, { Location: pathname + "/" + url.search }).end();
          return;
        }
        file = path.join(file, "index.html");
      }
    } catch {
      /* fall through to the 404 below */
    }

    fs.readFile(file, (err, data) => {
      if (err) {
        const notFound = path.join(base, "404.html");
        const body = fs.existsSync(notFound) ? fs.readFileSync(notFound) : "Not found";
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" }).end(body);
        return;
      }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" }).end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      // "localhost" (not 127.0.0.1) so the origin is the same secure context the service worker expects.
      resolve({ url: `http://localhost:${port}`, close: () => new Promise((r) => server.close(r)) });
    });
  });
}

module.exports = { start };
