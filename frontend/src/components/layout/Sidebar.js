import { useAuth } from "../../context/authContext";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { ReactComponent as Logo } from "../../assets/Logo.svg";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const links = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/clientes", label: "Clientes" },
    { path: "/arquivos", label: "Arquivos" },
  ];

  const adminLinks = [
    { path: "/tipo-documento", label: "Tipos de Documentos" },
    { path: "/usuarios", label: "Usuarios" },
    { path: "/logs", label: "Logs" },
  ];

  return (
    <>
    <button className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded shadow"
      onClick={() => setSidebarOpen(true)}
    >
      <HiMenu className="text-2xl" />
    </button>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 h-screen h-full w-64 bg-white border-r shadow-sm p-4 transform transition-transform z-50
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block`}
      >
        <div className="flex justify-end md:hidden mb-4">
          <button onClick={() => setSidebarOpen(false)}>
            <HiX className="text-2xl" />
          </button>
        </div>

        <div className="flex justify-center mb-16 mt-12">
            <Logo className="w-64 h-auto cursor-pointer" onClick={() => navigate('/dashboard')} />
        </div>

        <nav className="flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.path}
              className={`px-2 py-1 rounded ${
                isActive(link.path)
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-700 hover:text-blue-600"
              }`}
              to={link.path}
              onClick={() => setSidebarOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <hr />

          {user.role === "admin" &&
            adminLinks.map((link) => (
              <Link
                key={link.path}
                className={`px-2 py-1 rounded ${
                  isActive(link.path)
                    ? "bg-blue-100 text-blue-700 font-semibold"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
              >
                {link.label}
              </Link>
            ))}
        </nav>
      </aside>
    </>
  );
}
