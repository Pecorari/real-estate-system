import { useAuth } from "../../context/authContext";

export default function Navbar() {
  const { logout, user } = useAuth();

  return (
    <header className="w-full bg-white p-4 shadow-sm flex items-center lg:justify-between justify-end">
      <h1 className="text-lg font-semibold truncate hidden lg:block">SISTEMA DE CONTROLE DE ARQUIVOS </h1>

      <div className="flex items-center gap-4">
        {user && <p className="hidden xs:block">Olá, <span className="font-medium">{user.nome}</span></p>}
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-800 transition"
          onClick={() => logout()}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
