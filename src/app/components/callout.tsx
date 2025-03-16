export const Callout = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) => {
  return (
    <div className="border-4 border-black p-4 mb-8">
      <div className="font-bold">{title ?? "NOTE:"}</div>
      <div className="font-semibold">{children}</div>
    </div>
  );
};
