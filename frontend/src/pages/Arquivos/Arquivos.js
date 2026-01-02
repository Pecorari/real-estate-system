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
import { FaFolderPlus, FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function Arquivos() {
  const [arquivos, setArquivos] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const navigate = useNavigate();

  const carregarArquivos = async (pageAtual = page) => {
    try {
      setLoading(true);

      const { data } = await api.get("/arquivos", {
        params: {
          page: pageAtual,
          limit,
          q: search || undefined,
          status: status || undefined,
        },
      });

      setArquivos(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error("Erro ao carregar arquivos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = (valor) => {
    setStatus(valor);
  };

  useEffect(() => {
    carregarArquivos(page);
    // eslint-disable-next-line
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      carregarArquivos(1);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [search, status]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <Navbar />

        <div className="p-6 flex-1">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-center sm:text-left">Arquivos</h2>
              <Button onClick={() => setModalOpen(true)} className="w-auto"><FaFolderPlus /> Adicionar Arquivo</Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full sm:w-auto max-w-3xl">
              <div className="flex-1">
                <Input
                  label="Pesquisar"
                  placeholder="Pesquisar arquivos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
              <>
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
                <div className="flex justify_tables pagination items-center gap-4 mt-4 justify-center">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    className="bg-blue-600 hover:bg-blue-800 text-white rounded px-4 py-2 text-xs"
                  >
                    <FaArrowLeft />
                    {/* Anterior */}
                  </button>

                  <span className="text-sm">
                    Página {page} de {totalPages}
                  </span>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    className="bg-blue-600 hover:bg-blue-800 text-white rounded px-4 py-2 text-xs"
                  >
                    <FaArrowRight />
                    {/* Próxima */}
                  </button>
                </div>
              </>
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
