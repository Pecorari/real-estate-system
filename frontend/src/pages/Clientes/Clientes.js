import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import Footer from "../../components/layout/Footer";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import maskCpfCnpj from '../../utils/formatarCpfCnpj';
import api from "../../hooks/useApi";
import { FaUserPlus, FaLongArrowAltRight, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import titleCase from "../../utils/formatarTitleCase";
import { useNavigate } from "react-router-dom";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tiposCliente, setTiposCliente] = useState([]);
  const [tipoClienteId, setTipoClienteId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    cpf_cnpj: "",
    tipo_cliente_id: "",
    observacoes: ""
  });
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  const carregarClientes = async (pageAtual = page) => {
    setLoading(true);

    try {// eslint-disable-next-line
      const searchLimpo = /^[\d.\-\/]+$/.test(search) ? search.replace(/\D/g, "") : search;

      const { data } = await api.get("/clientes", {
        params: {
          page: pageAtual,
          limit,
          q: searchLimpo || undefined,
          tipo_cliente_id: tipoClienteId || undefined
        }
      });

      const formatados = data.data.map(r => ({
          ...r,
          tipo_cliente: {
            nome: titleCase(r.tipo_cliente.nome)
          }
      }))

      setClientes(formatados);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.log("Erro ao carregar clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { carregarClientes(1); }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [search]);
  useEffect(() => {
    carregarClientes(page);
    // eslint-disable-next-line
  }, [page, tipoClienteId]);
  useEffect(() => {
    async function carregarTipos() {
      const { data } = await api.get("/tipo-cli");

      const formatados = data.map(tipo => ({
          ...tipo,
          nome: titleCase(tipo.nome)
      }))

      setTiposCliente(formatados);
    }
    carregarTipos();
  }, []);

  const abrirCriar = () => {
    setErro("");
    setForm({
      nome: "",
      cpf_cnpj: "",
      tipo_cliente_id: "",
      observacoes: ""
    });
    setModalOpen(true);
  };

  const salvarCliente = async (e) => {
    e.preventDefault();

    try {
      await api.post("/clientes", form);

      setModalOpen(false);
      carregarClientes();
    } catch (err) {
      const mensagem = err?.response?.data?.error || "Erro ao salvar cliente.";
      setErro(mensagem);
      console.log("Erro ao salvar cliente:", err);
    }
  };

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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <Navbar />

        <div className="p-6 flex-1">
          <Card>
            <div className="flex flex-row items-center justify-between gap-2 mb-6">
              <h2 className="text-2xl font-bold text-left">
                Clientes
              </h2>
              <Button onClick={abrirCriar} className="w-min">
                <FaUserPlus />
                <span className="hidden md:inline">Cadastrar Cliente</span>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full sm:w-auto max-w-3xl">
              <div className="flex-1">
                <Input
                  label="Pesquisar"
                  placeholder="ID, Nome, CPF/CNPJ"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-52">
                <Select
                  label="Tipo"
                  value={tipoClienteId}
                  onChange={(e) => setTipoClienteId(Number(e.target.value))}
                >
                  <option value="">— Todos —</option>
                  {tiposCliente.map(tc => (
                    <option key={tc.id} value={tc.id}>
                      {tc.nome}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {loading ? (
              <p>Carregando...</p>
            ) : (
              <>
                <Table columns={["ID", "Nome", "CPF/CNPJ", "Tipo", "Observações", ""]}
                  data={clientes.map((c) => ({
                    id: c.id,
                    nome: c.nome,
                    cpf_cnpj: c.cpf_cnpj,
                    tipo: c.tipo_cliente?.nome || "-",
                    observacoes: c.observacoes,
                    detalhe: <span className="text-lg text-gray-500 hover:text-blue-700 transition-colors"><FaLongArrowAltRight /></span>,
                  }))}
                  onRowClick={(row) => navigate(`/clientes/${row.id}`)}
                />
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

      <Modal isOpen={modalOpen} onClose={() => {setModalOpen(false); setErro("");}}>
        <h2 className="text-lg font-semibold mb-3">
          Novo Cliente
        </h2>

        <form onSubmit={salvarCliente}>
          <Input
            label="Nome"
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />

          <Input
            label="CPF / CNPJ"
            required
            value={form.cpf_cnpj}
            onChange={(e) => setForm({ ...form, cpf_cnpj: maskCpfCnpj(e.target.value) })}
          />

          <Input
            label="observacoes"
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          />

          <Select
            required
            label="Tipo"
            value={form.tipo_cliente_id}
            onChange={(e) => setForm({ ...form, tipo_cliente_id: Number(e.target.value) })}
          >
            <option value="">Selecione</option>
            {tiposCliente.map(tc => (
              <option key={tc.id} value={tc.id}>
                {tc.nome}
              </option>
            ))}
          </Select>

          {erro && (<div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-3">{erro}</div>)}
          <Button type="submit" className="mt-4 w-full">
            Salvar
          </Button>
        </form>
      </Modal>
    </div>
  );
}
