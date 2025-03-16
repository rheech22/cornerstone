export const Blockquote = async ({
  children,
  from,
}: {
  children: React.ReactNode;
  from?: string;
}) => {
  return (
    <blockquote>
      <div className="text-4xl leading-none font-medium">{children}</div>
      {from && <span className="text-2xl font-light">— {from}</span>}
    </blockquote>
  );
};
