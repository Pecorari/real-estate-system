import { useAuth } from "../../context/authContext";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-white border-r shadow-sm p-4 hidden md:block">
      <h2 className="text-xl font-bold mb-6">Imobiliária</h2>

      <nav className="flex flex-col gap-4">
        <Link className="text-gray-700 hover:text-blue-600" to="/dashboard">Dashboard</Link>

        <Link className="text-gray-700 hover:text-blue-600" to="/clientes">Clientes</Link>

        <Link className="text-gray-700 hover:text-blue-600" to="/arquivos">Arquivos</Link>

        {(user.role === 'admin') ? <Link className="text-gray-700 hover:text-blue-600" to="/usuarios">Usuarios</Link> : <></>}
      </nav>
    </aside>
  );
}
