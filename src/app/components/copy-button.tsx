"use client";

import { useState } from "react";

export const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const title = copied ? "Copied!" : "Copy to clipboard";

  return (
    <button
      className={`absolute right-5 top-5 z-10 p-2 transition-all duration-300 border ${
        copied
          ? "text-black border-black"
          : "border-transparent hover:border-black"
      }`}
      onClick={copyToClipboard}
      title={title}
      aria-label={title}
    >
      <span className="sr-only">{title}</span>
      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path
            d="M4 12L9 17L20 6"
            className="check-mark"
            style={{
              strokeDasharray: 30,
              strokeDashoffset: 30,
              animation: "drawCheck 0.5s ease forwards",
            }}
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
      )}
      <style jsx>{`
        @keyframes drawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </button>
  );
};
