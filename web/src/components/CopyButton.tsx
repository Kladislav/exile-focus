import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useI18n } from "../i18n";

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="chip"
      title={`${t("copy")}: ${text}`}
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {label && <span>{copied ? t("copied") : label}</span>}
    </button>
  );
}
