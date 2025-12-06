export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r shadow-sm p-4 hidden md:block">
      <h2 className="text-xl font-bold mb-6">Imobiliária</h2>

      <nav className="flex flex-col gap-4">
        <a className="text-gray-700 hover:text-blue-600" href="/dashboard">
          Dashboard
        </a>

        <a className="text-gray-700 hover:text-blue-600" href="/clientes">
          Clientes
        </a>

        <a className="text-gray-700 hover:text-blue-600" href="/arquivos">
          Arquivos
        </a>
        
        <a className="text-gray-700 hover:text-blue-600" href="/usuarios">
          Usuarios
        </a>
      </nav>
    </aside>
  );
}
