export default function Input({ label, ...props }) {
  return (
    <div className="flex flex-col mb-3 w-full">
      {label && <label className="text-sm font-medium mb-1">{label}</label>}
      <input
        {...props}
        className="border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
