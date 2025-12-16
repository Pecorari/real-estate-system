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

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    cpf_cnpj: "",
    tipo: "locador",
    observacoes: ""
  });
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [erro, setErro] = useState("");

  const carregarClientes = async (pageAtual = page) => {
    setLoading(true);

    try {// eslint-disable-next-line
      const searchLimpo = /^[\d.\-\/]+$/.test(search) ? search.replace(/\D/g, "") : search;

      const { data } = await api.get("/clientes", {
        params: {
          page: pageAtual,
          limit,
          q: searchLimpo || undefined,
          tipo: tipo || undefined
        }
      });

      setClientes(data.data);
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
    setPage(1);
    carregarClientes(1);
    // eslint-disable-next-line
  }, [tipo]);
  useEffect(() => {
    carregarClientes(page);
    // eslint-disable-next-line
  }, [page]);

  const abrirCriar = () => {
    setEditId(null);
    setForm({ nome: "", cpf_cnpj: "", tipo: "locador", observacoes: "" });
    setModalOpen(true);
  };

  const abrirEditar = (cliente) => {
    setEditId(cliente.id);
    setForm({
      nome: cliente.nome,
      cpf_cnpj: cliente.cpf_cnpj,
      tipo: cliente.tipo,
      observacoes: cliente.observacoes,
    });
    setModalOpen(true);
  };

  const salvarCliente = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        console.log(form);
        await api.put(`/clientes/${editId}`, form);
      } else {
        console.log(form);
        await api.post("/clientes", form);
      }

      setModalOpen(false);
      carregarClientes();
    } catch (err) {
      console.log("Erro ao salvar cliente:", err);
    }
  };

  const deletarCliente = async () => {
    try {
      await api.delete(`/clientes/${deleteId}`);
      setModalDeleteOpen(false);
      carregarClientes();
    } catch (err) {
      console.log("Erro ao deletar cliente:", err);
      setErro(err?.response?.data?.error);
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

  const handleTipo = (valor) => {
    setTipo(valor);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <Navbar />

        <div className="p-6 flex-1">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
              <h2 className="text-2xl font-bold text-center sm:text-left">
                Clientes
              </h2>

              <Button onClick={abrirCriar} className="w-auto">+ Cadastrar Cliente</Button>
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
                  value={tipo}
                  onChange={(e) => handleTipo(e.target.value)}
                >
                  <option value="">— Todos —</option>
                  <option value="locador">Locador</option>
                  <option value="locatario">Locatário</option>
                  <option value="ambos">Ambos</option>
                </Select>
              </div>
            </div>

            {loading ? (
              <p>Carregando...</p>
            ) : (
              <>
                <Table columns={["ID", "Nome", "CPF/CNPJ", "Tipo", "Observações", "Ações"]}
                  data={clientes.map((c) => ({
                    id: c.id,
                    nome: c.nome,
                    cpf_cnpj: c.cpf_cnpj,
                    tipo: c.tipo,
                    observacoes: c.observacoes,
                    ações: (
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => abrirEditar(c)}
                        >
                          Editar
                        </button>

                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => {
                            setDeleteId(c.id);
                            setModalDeleteOpen(true);
                          }}
                        >
                          Deletar
                        </button>
                      </div>
                    ),
                  }))}
                />
                <div className="flex justify-center items-center gap-3 mt-4">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    className="bg-blue-600 hover:bg-blue-800 text-white rounded px-4 py-2 text-xs"
                  >
                    Anterior
                  </button>

                  <span className="text-sm text-gray-600">
                    Página {page} de {totalPages}
                  </span>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    className="bg-blue-600 hover:bg-blue-800 text-white rounded px-4 py-2 text-xs"
                  >
                    Próxima
                  </button>
                </div>
              </>
            )}
          </Card>
        </div>

        <Footer />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-lg font-semibold mb-3">
          {editId ? "Editar Cliente" : "Novo Cliente"}
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
            required
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          />

          <Select
            label="Tipo"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            <option value="locador">Locador</option>
            <option value="locatario">Locatário</option>
            <option value="ambos">Ambos</option>
          </Select>

          <Button type="submit" className="mt-4 w-full">
            Salvar
          </Button>
        </form>
      </Modal>

      <Modal isOpen={modalDeleteOpen} onClose={() => setModalDeleteOpen(false)}>
        <h2 className="text-lg font-semibold mb-3">Excluir cliente?</h2>
        <p>Essa ação não poderá ser desfeita.</p>
        {erro ? <span className="text-red-600 text-sm">{erro}</span> : <></>}
        <div className="flex gap-2 mt-4">
          <Button
            className="bg-gray-400 hover:bg-gray-500"
            onClick={() => {setModalDeleteOpen(false); setErro("")}}
          >
            Cancelar
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={deletarCliente}
          >
            Deletar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
