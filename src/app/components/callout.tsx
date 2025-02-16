export const Callout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border border-black">
      <span>Note:</span>
      {children}
    </div>
  );
};
