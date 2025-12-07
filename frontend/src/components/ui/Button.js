export function Button({ children, ...props }) {
  return (
    <button
      {...props}
      className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded transition w-max md:w-auto flex items-center gap-2"
    >
      {children}
    </button>
  );
}
