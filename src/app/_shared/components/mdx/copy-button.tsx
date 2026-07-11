import { cn } from "@/shared/lib/cn";

// Define Icon components within the same file
const CheckIcon = () => (
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
    className={cn("h-5 w-5")}
  >
    <path
      d="M4 12L9 17L20 6"
      className={cn("check-mark")}
      style={{
        strokeDasharray: 30,
        strokeDashoffset: 30,
      }}
    />
  </svg>
);

const CopyIcon = () => (
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
    className={cn("h-5 w-5")}
  >
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
  </svg>
);

type CopyButtonProps = {
  singleLine?: boolean;
};

export const CopyButton = ({ singleLine = false }: CopyButtonProps) => {
  const title = "Copy to clipboard";

  return (
    <button
      type="button"
      data-copy-code="true"
      className={cn(
        "absolute right-5 z-10 cursor-copy border p-2 opacity-0 transition-all duration-300 pointer-events-none group-hover/code-block:pointer-events-auto group-hover/code-block:opacity-100 group-focus-within/code-block:pointer-events-auto group-focus-within/code-block:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 hover:border-vague-line hover:bg-vague-surface hover:text-vague-amber",
        singleLine ? "top-1/2 -translate-y-1/2" : "top-5",
        "border-transparent",
      )}
      title={title}
      aria-label={title}
    >
      <span data-copy-label className={cn("sr-only")}>{title}</span>
      <span data-copy-default><CopyIcon /></span>
      <span data-copy-success hidden><CheckIcon /></span>
    </button>
  );
};
