import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "tsx" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative w-full max-w-full overflow-hidden rounded-lg border border-border bg-[#0d1117]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? (
            <>
              <FiCheck className="h-3.5 w-3.5 text-green-400" />
              Copied
            </>
          ) : (
            <>
              <FiCopy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="w-full min-w-0 overflow-x-auto p-4 text-sm leading-relaxed">
        {" "}
        {/* added w-full min-w-0 */}
        <code className="font-mono text-[#e6edf3]">{code}</code>
      </pre>
    </div>
  );
}
