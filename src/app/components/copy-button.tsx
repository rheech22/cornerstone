"use client";

import { useState } from "react";

export const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 800);
  };

  return (
    <button
      className="absolute right-5 top-10 z-10"
      onClick={copyToClipboard}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? "✅" : "📋"}
    </button>
  );
};
