export const Blockquote = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <blockquote className="bg-gradient-to-t from-gray-100 to-gray-200 p-4 rounded-lg text-gray-800">
      {children}
    </blockquote>
  );
};
