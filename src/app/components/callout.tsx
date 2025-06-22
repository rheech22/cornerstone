export const Callout = ({
  children,
  title = "NOTE",
}: {
  children: React.ReactNode;
  title?: string;
}) => {
  return (
    <div className="flex flex-col pt-4 pb-2 px-4 mt-11 mb-12 callout">
      <span className="font-bold text-xl mb-4 px-2 py-1 w-fit border-[#efefef] border-2 rounded-md max-w-[85%]">
        {title}
      </span>
      <div>{children}</div>
    </div>
  );
};
