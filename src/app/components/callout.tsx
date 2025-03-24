export const Callout = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) => {
  return (
    <div className="border-4 border-black p-4 mb-8">
      <div className="font-bold mb-4">{title ?? "NOTE"}</div>
      <div>{children}</div>
    </div>
  );
};
