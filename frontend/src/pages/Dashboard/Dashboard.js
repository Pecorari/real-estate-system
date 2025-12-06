import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import Card from "../../components/ui/Card";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Navbar />

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h2 className="text-lg font-semibold">Total de Clientes</h2>
            <p className="text-2xl font-bold mt-2">28</p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Arquivos Cadastrados</h2>
            <p className="text-2xl font-bold mt-2">143</p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Corretores Ativos</h2>
            <p className="text-2xl font-bold mt-2">2</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
