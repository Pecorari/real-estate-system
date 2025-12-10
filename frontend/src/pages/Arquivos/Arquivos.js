import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLongArrowAltRight } from "react-icons/fa";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import Footer from "../../components/layout/Footer";
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

      <div className="flex-1 flex flex-col overflow-auto">
        <Navbar />

        <div className="p-6 flex-1">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-center sm:text-left">Arquivos</h2>
              <Button onClick={() => setModalOpen(true)} className="w-auto">+ Adicionar Arquivo</Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full sm:w-auto max-w-3xl">
              <div className="flex-1">
                <Input
                  label="Pesquisar"
                  placeholder="Pesquisar arquivos..."
                  value={busca}
                  onChange={(e) => handleInput(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-52">
                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => handleStatus(e.target.value)}
                >
                  <option value="">— Todos —</option>
                  <option value="ativo">Ativo</option>
                  <option value="encerrado">Encerrado</option>
                  <option value="inadimplente">Inadimplente</option>
                </Select>
              </div>
            </div>

            {loading ? (
              <p className="text-gray-600">Carregando...</p>
            ) : (
              <Table
                columns={["ID", "Locador", "Locatário", "Status", ""]}
                data={arquivos.map((arq) => ({
                  id: arq.id,
                  locador: arq.locador_nome,
                  locatario: arq.locatario_nome,
                  status: arq.status || "—",
                  detalhe: <span className="text-lg text-gray-500 hover:text-blue-700 transition-colors"><FaLongArrowAltRight /></span>
                }))}
                onRowClick={(row) => navigate(`/arquivos/${row.id}`)}
              />
            )}
          </Card>
        </div>

        <Footer />
      </div>

      <ModalArquivo
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={carregarArquivos}
      />
    </div>
  );
}
