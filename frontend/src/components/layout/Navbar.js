import { useAuth } from "../../context/authContext";

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <header className="w-full bg-white p-4 shadow-sm flex items-center justify-between">
      <h1 className="text-lg font-semibold">Painel Administrativo</h1>

      <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => logout()}>
        Logout
      </button>
    </header>
  );
}
