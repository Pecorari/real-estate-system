import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import api from "../../hooks/useApi";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import ModalArquivo from "./ModalArquivo";

export default function Arquivos() {
  const [arquivos, setArquivos] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const carregarArquivos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/arquivos");
      setArquivos(data);
    } catch (err) {
      console.error("Erro ao carregar arquivos:", err);
    } finally {
      setLoading(false);
    }
  };

  const pesquisar = async (valorBusca = "", statusBusca = "") => {
    setBusca(valorBusca);

    if (!valorBusca.trim() && !statusBusca) {
      carregarArquivos();
      return;
    }

    try {
      const { data } = await api.get("/search/arquivos", {
        params: {
          q: valorBusca.trim() !== "" ? valorBusca.trim() : undefined,
          status: statusBusca !== "" ? statusBusca : undefined
        },
      });
      setArquivos(data);
    } catch (err) {
      console.error("Erro ao pesquisar arquivos:", err);
    }
  };

  const handleInput = (valor) => {
    setSearch(valor);

    if (valor.trim() === "" && status === "") {
      carregarArquivos();
      return;
    }

    pesquisar(valor, status);
  };

  const handleStatus = (valor) => {
    setStatus(valor);
    pesquisar(search, valor);
  };

  useEffect(() => {
    carregarArquivos();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Navbar />

        <div className="p-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Arquivos</h2>
              <Button onClick={() => setModalOpen(true)}>Adicionar Arquivo</Button>
            </div>

            <div className="mb-4 w-64">
              <Input
                placeholder="Pesquisar arquivos..."
                value={busca}
                onChange={(e) => handleInput(e.target.value)}
              />
              <Select value={status} onChange={(e) => handleStatus(e.target.value)}>
                <option value="">— Todos —</option>
                <option value="ativo">Ativo</option>
                <option value="encerrado">Encerrado</option>
                <option value="inadimplente">Inadimplente</option>
              </Select>
            </div>

            {loading ? (
              <p className="text-gray-600">Carregando...</p>
            ) : (
              <Table
                columns={["ID", "Locador", "Locatário", "Status"]}
                data={arquivos.map((arq) => ({
                  id: arq.id,
                  locador: arq.locador_nome,
                  locatario: arq.locatario_nome,
                  status: arq.status || "—",
                }))}
                onRowClick={(row) => navigate(`/arquivos/${row.id}`)}
              />
            )}
          </Card>
        </div>
      </div>

      <ModalArquivo
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={carregarArquivos}
      />
    </div>
  );
}
