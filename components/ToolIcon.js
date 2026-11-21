import {
  Dices,
  Fingerprint,
  Gauge,
  Grid3x3,
  KeyRound,
  ShieldAlert,
  UserRound,
  Vault,
} from "lucide-react";

const ICONS = {
  "/": KeyRound,
  "/passphrase-generator/": Dices,
  "/password-strength-checker/": Gauge,
  "/breach-checker/": ShieldAlert,
  "/pin-generator/": Grid3x3,
  "/username-generator/": UserRound,
  "/hash-generator/": Fingerprint,
  "/vault/": Vault,
};

/** Icon tile used in tool grids. */
export default function ToolIcon({ path, size = 22 }) {
  const Icon = ICONS[path] || KeyRound;
  return (
    <span
      aria-hidden="true"
      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-muted text-primary-text"
    >
      <Icon size={size} />
    </span>
  );
}
