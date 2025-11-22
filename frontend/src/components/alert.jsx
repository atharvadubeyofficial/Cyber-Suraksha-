export function Alert({ title, description, className = "" }) {
  return (
    <div className={`border-l-4 border-blue-600 bg-blue-50 p-4 rounded-md ${className}`}>
      <h4 className="font-semibold text-blue-700">{title}</h4>
      <p className="text-sm text-blue-600 mt-1">{description}</p>
    </div>
  );
}
