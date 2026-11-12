import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useI18n } from "../i18n";

/** Копирование в буфер с отметкой «скопировано» на 1,2 с. */
export function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = () =>
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  return [copied, copy] as const;
}

/** `state` — общий useCopy, если копировать можно и кликом по другому элементу. */
export function CopyButton({
  text,
  label,
  state,
}: {
  text: string;
  label?: string;
  state?: readonly [boolean, () => void];
}) {
  const { t } = useI18n();
  const own = useCopy(text);
  const [copied, copy] = state ?? own;
  return (
    <button
      className="chip"
      title={`${t("copy")}: ${text}`}
      onClick={(e) => {
        e.stopPropagation();
        copy();
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {label && <span>{copied ? t("copied") : label}</span>}
    </button>
  );
}
