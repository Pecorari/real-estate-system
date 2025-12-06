import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} mx-4 p-6 relative`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Botão de Fechar */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>


            {/* Título */}
            {title && (
              <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
            )}


            {/* Conteúdo */}
            <div>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
