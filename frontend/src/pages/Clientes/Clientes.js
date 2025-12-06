import { useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Input from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export default function Clientes() {
  const [search, setSearch] = useState("");

  const clientes = [
    { id: 1, nome: "João Silva", telefone: "19 91234-5678" },
    { id: 2, nome: "Maria Souza", telefone: "19 99876-5432" },
  ];

  const filtro = clientes.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Navbar />

        <div className="p-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Clientes</h2>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <Input
                label="Pesquisar"
                placeholder="Nome do cliente"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <Button className="md:w-auto">Cadastrar Cliente</Button>
            </div>

            <Table
              columns={["ID", "Nome", "Telefone"]}
              data={filtro}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
