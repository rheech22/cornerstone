import { cn } from "@/shared/lib/cn";

export const Callout = ({
  children,
  title = "NOTE",
}: {
  children: React.ReactNode;
  title?: string;
}) => {
  return (
    <div className={cn("mt-11 mb-12 flex flex-col px-4 pt-4 pb-2 callout")}>
      <span className={cn("mb-4 w-fit max-w-[85%] text-lg font-bold text-vague-warning")}>
        {title}
      </span>
      <div>{children}</div>
    </div>
  );
};
