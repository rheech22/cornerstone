export const Blockquote = async ({
  children,
  from,
}: {
  children: React.ReactNode;
  from?: string;
}) => {
  return (
    <blockquote>
      <div className="text-[1.5em] leading-none font-medium">{children}</div>
      {from && <span className="text-[1.25em] font-light">— {from}</span>}
    </blockquote>
  );
};
