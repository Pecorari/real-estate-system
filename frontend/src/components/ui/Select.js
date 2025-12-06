export function Select({ label, children, ...props }) {
  return (
    <div className="flex flex-col mb-3 w-full">
      {label && <label className="text-sm font-medium mb-1">{label}</label>}
      <select
        {...props}
        className="border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
      >
        {children}
      </select>
    </div>
  );
}
