"use client";

import { useState } from "react";

export const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className={`absolute right-5 top-10 z-10 rounded-md p-2 transition-all duration-300 ${
        copied
          ? "bg-green-100 text-green-600 dark:bg-green-800/30 dark:text-green-400"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:hover:bg-gray-700/30"
      }`}
      onClick={copyToClipboard}
      title={copied ? "Copied!" : "Copy to clipboard"}
      aria-label={copied ? "Copied!" : "Copy to clipboard"}
    >
      <span className="sr-only">
        {copied ? "Copied!" : "Copy to clipboard"}
      </span>
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
          className="h-5 w-5 transition-transform duration-200 hover:scale-105"
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
