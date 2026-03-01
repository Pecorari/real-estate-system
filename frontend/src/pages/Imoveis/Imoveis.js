import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import Footer from "../../components/layout/Footer";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import maskCpfCnpj from '../../utils/formatarCpfCnpj';
import api from "../../hooks/useApi";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Imoveis() {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tipoImovel, setTipoImovel] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const navigate = useNavigate();

  const carregarImoveis = async (pageAtual = page) => {
    setLoading(true);

    try {
      const searchLimpo = /^[\d.\-\/]+$/.test(search) ? search.replace(/\D/g, "") : search;

      const { data } = await api.get("/imoveis", {
        params: {
          page: pageAtual,
          limit,
          q: searchLimpo || undefined,
          status: status || undefined,
          tipo_imovel: tipoImovel || undefined,
        }
      });

      setImoveis(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.log("Erro ao carregar os imoveis:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { carregarImoveis(page); }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [search, status, tipoImovel, page]);

  const handleSearchChange = (value) => {
    const temLetra = /[a-zA-Z]/.test(value);
    const apenasNumeros = value.replace(/\D/g, "");

    if (temLetra) {
      setSearch(value);
      return;
    }

    if (apenasNumeros.length <= 14) {
      setSearch(maskCpfCnpj(apenasNumeros));
    }
  };

  const statusImovelStyles = {
    disponivel: "bg-green-100 text-green-700",
    alugado: "bg-red-100 text-red-700",
    inativo: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <Navbar />

        <div className="p-6 flex-1">
          <Card>
            <div className="flex flex-row items-center justify-between gap-2 mb-6">
              <h2 className="text-2xl font-bold text-left">
                Imoveis
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full sm:w-auto max-w-3xl">
              <div className="flex-1">
                <Input
                  label="Pesquisar"
                  placeholder="Rua ou Bairro"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-52">
                <Select
                  label="Tipo de Imovel"
                  value={tipoImovel}
                  onChange={(e) => {setTipoImovel(e.target.value); setPage(1);}}
                >
                  <option value="">— Todos —</option>
                  <option value="residencial">Residencial</option>
                  <option value="comercial">Comercial</option>
                </Select>
              </div>

              <div className="w-full sm:w-52">
                <Select
                  label="Tipo de Imovel"
                  value={status}
                  onChange={(e) => {setStatus(e.target.value); setPage(1);}}
                >
                  <option value="">— Todos —</option>
                  <option value="disponivel">Disponivel</option>
                  <option value="alugado">Alugado</option>
                  <option value="inativo">Inativo</option>
                </Select>
              </div>
            </div>

            {loading ? (
              <p>Carregando...</p>
            ) : imoveis.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p className="text-lg font-semibold">Nenhum imóvel encontrado</p>
                <p className="text-sm mt-1">
                  Tente ajustar os filtros ou remover a pesquisa.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 mt-8 text-sm sm:text-base">
                  {imoveis.map((imovel) => (
                    <div key={imovel.id} onClick={() => navigate(`/clientes/${imovel.cliente_id}`)} className="relative border rounded-xl p-5 bg-white shadow cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-blue-400">
                      <span className={`absolute top-0 right-0 px-2 py-1 text-xs font-semibold rounded-bl-lg rounded-tr-lg shadow-sm ${statusImovelStyles[imovel.status] || "bg-gray-100 text-gray-600"}`}>
                        {imovel.status.charAt(0).toUpperCase() + imovel.status.slice(1)}
                      </span>
                      <p className="mr-16"><strong>Endereço:</strong> {imovel.logradouro} n°{imovel.numero}, {imovel.bairro}, {imovel.cidade} - {imovel.estado}</p>
                      <p><strong>CEP:</strong> {imovel.cep}</p>
                      <p><strong>Tipo:</strong> {imovel.tipo_imovel}</p>
                      <p><strong>Área:</strong> {imovel.area_m2} m²</p>
                      {imovel.descricao ? <p><strong>Descrição:</strong> {imovel.descricao}</p> : <></>}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center items-center gap-3 mt-4">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    className="bg-blue-600 hover:bg-blue-800 text-white rounded px-4 py-2 text-xs"
                  >
                    <FaArrowLeft />
                  </button>

                  <span className="text-sm text-gray-600">
                    Página {page} de {totalPages}
                  </span>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    className="bg-blue-600 hover:bg-blue-800 text-white rounded px-4 py-2 text-xs"
                  >
                    <FaArrowRight />
                  </button>
                </div>
              </>
            )}
          </Card>
        </div>

        <Footer />
      </div>
    </div>
  );
}
