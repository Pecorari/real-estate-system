export default function Modal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose} // fechar clicando fora
    >
      <div
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md animate-[fadein_0.2s_ease]"
        onClick={(e) => e.stopPropagation()} // impede fechar ao clicar dentro
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Conteúdo */}
        <div>{children}</div>
      </div>
    </div>
  );
}
