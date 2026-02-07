import { cn } from "../lib/cn";

export const Blockquote = async ({
  children,
  from,
}: {
  children: React.ReactNode;
  from?: string;
}) => {
  return (
    <blockquote>
      <div className={cn("text-[1.5em] leading-none font-medium")}>{children}</div>
      {from && <span className={cn("text-[1.25em] font-light")}>— {from}</span>}
    </blockquote>
  );
};
