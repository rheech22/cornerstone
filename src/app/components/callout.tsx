import { cn } from "../lib/cn";

export const Callout = ({
  children,
  title = "NOTE",
}: {
  children: React.ReactNode;
  title?: string;
}) => {
  return (
    <div className={cn("mt-11 mb-12 flex flex-col px-4 pt-4 pb-2 callout")}>
      <span className={cn("mb-4 w-fit max-w-[85%] rounded-md border-2 border-[var(--color-canvas)] px-2 py-1 text-xl font-bold")}>
        {title}
      </span>
      <div>{children}</div>
    </div>
  );
};
