export function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-block rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}
