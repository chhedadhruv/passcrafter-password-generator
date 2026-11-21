import React, { useState } from "react";
import { KeyRound, Lock } from "lucide-react";
import PasswordGenerator from "../../components/PasswordGenerator";
import VaultApp from "../../components/VaultApp";

const TABS = [
  { id: "generate", label: "Generate", icon: KeyRound },
  { id: "vault", label: "Vault", icon: Lock },
];

export default function App() {
  const [tab, setTab] = useState("generate");
  // Bumped when the generator hands a password to the vault, so an already-unlocked vault opens its add form.
  const [signal, setSignal] = useState(0);

  return (
    <div className="p-4">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="icons/icon-32.png" alt="" width="28" height="28" className="rounded-lg" />
          <span className="text-lg font-bold tracking-tight">PassCrafter</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold">
          {/* Some browsers close the popup when a file picker opens; a tab avoids that for imports. */}
          <a href="popup.html" target="_blank" rel="noopener" className="text-primary-text underline">
            Open in tab
          </a>
          <a
            href="https://passcrafter.dhruvchheda.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-text underline"
          >
            Website
          </a>
        </div>
      </header>

      <div role="tablist" aria-label="PassCrafter" className="mb-4 grid grid-cols-2 gap-1 rounded-full border border-border bg-surface p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setTab(id)}
            className={`flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-bold transition ${
              tab === id ? "bg-primary text-on-primary" : "text-text-secondary hover:text-text"
            }`}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Both panels stay mounted so the vault doesn't lock when you flip to the generator. */}
      <div role="tabpanel" id="panel-generate" aria-labelledby="tab-generate" hidden={tab !== "generate"}>
        <PasswordGenerator
          onSaveToVault={() => {
            setSignal((s) => s + 1);
            setTab("vault");
          }}
        />
      </div>
      <div role="tabpanel" id="panel-vault" aria-labelledby="tab-vault" hidden={tab !== "vault"}>
        <VaultApp consumeSignal={signal} autoClearClipboard={false} />
      </div>

      <p className="mt-4 text-center text-xs text-text-secondary">
        Everything runs in this popup. Nothing is sent anywhere.
      </p>
    </div>
  );
}
