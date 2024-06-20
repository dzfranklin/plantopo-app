export default function Skeleton({
  maxWidth = 224,
  height = 384,
  children,
}: {
  maxWidth: number | string;
  height: number | string;
  children?: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className="flex items-center justify-center bg-gray-300 rounded-lg animate-pulse"
      style={{ maxWidth, height }}
    >
      <span className="sr-only">Loading...</span>
      {children}
    </div>
  );
}
