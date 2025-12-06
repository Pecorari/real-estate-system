import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";

export default function Arquivos() {
  const arquivos = [
    { id: 101, nome: "Contrato João.pdf", cliente: "João Silva" },
    { id: 102, nome: "Ficha Maria.pdf", cliente: "Maria Souza" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Navbar />

        <div className="p-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Arquivos</h2>
              <Button>Adicionar Arquivo</Button>
            </div>

            <Table
              columns={["ID", "Nome", "Cliente"]}
              data={arquivos}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
