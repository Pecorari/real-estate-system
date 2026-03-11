import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";
import Sidebar from "../../../components/layout/Sidebar";
import Footer from "../../../components/layout/Footer";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Modal from "../../../components/ui/Modal";
import api from "../../../hooks/useApi";
import maskCpfCnpj from '../../../utils/formatarCpfCnpj';
import titleCase from "../../../utils/formatarTitleCase";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import { BsHouseAdd } from "react-icons/bs";
import { Button } from "../../../components/ui/Button";
import formatarCep from "../../../utils/formatarCep";

export default function ClienteDetalhe() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [arquivos, setArquivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tiposCliente, setTiposCliente] = useState([]);
  const [modalEditClienteOpen, setModalEditClienteOpen] = useState(false);
  const [modalImovelOpen, setModalImovelOpen] = useState(false);
  const [editImovelId, setEditImovelId] = useState(null);
  const [delImovelId, setDelImovelId] = useState(null);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [erro, setErro] = useState("");
  const [formCliente, setFormCliente] = useState({
    nome: "",
    cpf_cnpj: "",
    tipo_cliente_id: "",
    observacoes: ""
  });
  const [formImovel, setFormImovel] = useState({
    cliente_id: Number(id),
    tipo_imovel: "",
		cep: "",
		logradouro: "",
		numero: "",
		complemento: "",
		bairro: "",
		cidade: "",
		estado: "",
		area_m2: 0,
		status: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    carregarCliente();
    carregarArquivos();
    carregarTipos();
    // eslint-disable-next-line
  }, [id]);
  useEffect(() => {
  if (formImovel.cep.length === 8) {
    buscarCep(formImovel.cep);
  }
}, [formImovel.cep]);

  const carregarCliente = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/clientes/${id}`);
      setCliente(data.cliente);
    } catch (err) {
      console.error("Erro ao carregar cliente:", err);
    } finally {
      setLoading(false);
    }
  };

  const carregarArquivos = async () => {
    try {
      const { data } = await api.get(`/arquivos/${id}`);
  
      setArquivos(data);
    } catch (err) {
      console.error("Erro ao carregar arquivos deste cliente:", err);
    }
  }

  const carregarTipos = async () => {
    try {
      const { data } = await api.get("/tipo-cli");
  
      const formatados = data.map(tipo => ({
          ...tipo,
          nome: titleCase(tipo.nome)
      }))
  
      setTiposCliente(formatados);
    } catch (err) {
      console.error("Erro ao carregar os tipos de cliente:", err);
    }
  }

  const abrirEditarCliente = () => {
    setErro("");
    setFormCliente({
      nome: cliente.nome || "",
      cpf_cnpj: cliente.cpf_cnpj || "",
      tipo_cliente_id: cliente.tipo_cliente_id || "",
      observacoes: cliente.observacoes || ""
    });
    setModalEditClienteOpen(true);
  };

  const editarCliente = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/clientes/${id}`, formCliente);

      setModalEditClienteOpen(false);
      carregarCliente();
    } catch (err) {
      const mensagem = err?.response?.data?.error || "Erro ao editar cliente.";
      setErro(mensagem);
      console.log("Erro ao editar cliente:", err);
    }
  };

  const deletarImovelOuCliente = async () => {
    try {
      if (delImovelId) {
        await api.delete(`/imoveis/${delImovelId}`);
        console.log("imovel apagado");
        carregarCliente();
      } else {
        await api.delete(`/clientes/${id}`);
        console.log("cliente apagado");
        navigate("/clientes")
      }

      setModalDeleteOpen(false);
    } catch (err) {
      const mensagem = err?.response?.data?.error || "Erro ao deletar cliente.";
      setErro(mensagem);
      console.log("Erro ao deletar cliente:", err);
    }
  };

  const abrirModalDeletar = (imovel) => {
    setDelImovelId(imovel?.id || null)
    setErro("");
    setModalDeleteOpen(true);
  };


  const abrirAddImovel = () => {
    setEditImovelId(null)
    setErro("");
    setFormImovel({
      cliente_id: Number(id),
      tipo_imovel: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      area_m2: 0,
      status: ""
    });
    setModalImovelOpen(true);
  };

  const abrirEditarImovel = (imovel) => {
    setEditImovelId(imovel.id)
    setErro("");
    setFormImovel({
      cliente_id: Number(id),
      tipo_imovel: imovel.tipo_imovel,
      cep: imovel.cep,
      logradouro: imovel.logradouro,
      numero: imovel.numero,
      complemento: imovel.complemento,
      bairro: imovel.bairro,
      cidade: imovel.cidade,
      estado: imovel.estado,
      area_m2: imovel.area_m2,
      status: imovel.status
    });
    setModalImovelOpen(true);
  };

  const salvarImovel = async (e) => {
    console.log(formImovel);
    e.preventDefault();

    try {
       if (editImovelId) {
        await api.put(`/imoveis/${editImovelId}`, formImovel);
      } else {
        await api.post("/imoveis", formImovel);
      }

      setModalImovelOpen(false);
      carregarCliente();
    } catch (err) {
      const mensagem = err?.response?.data?.error || "Erro ao salvar imovel.";
      setErro(mensagem);
      console.log("Erro ao salvar imovel:", err);
    }
  };

  const podeTerImovel =
    cliente?.tipo_cliente?.nome === "locador" ||
    cliente?.tipo_cliente?.nome === "ambos";

  const buscarCep = async (cep) => {
    try {
      if (cep.length !== 8) return;

      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();

      if (data.erro) return;

      setFormImovel((prev) => ({
        ...prev,
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || ""
      }));
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    }
  };

  const statusImovelStyles = {
    disponivel: "bg-green-100 text-green-700",
    alugado: "bg-red-100 text-red-700",
    inativo: "bg-gray-100 text-gray-600",
  };

  const statusArquivoStyles = {
    ativo: {
      bg: "bg-lime-500",
      text: "text-green-700",
    },
    encerrado: {
      bg: "bg-zinc-500",
      text: "text-gray-600",
    },
    inadimplente: {
      bg: "bg-amber-500",
      text: "text-yellow-700",
    },
  };

  if (loading || !cliente) return <p className="p-6">Carregando...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <Navbar />

        <div className="p-6 space-y-6 flex-1">
          <Card>
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <button
                  className="text-gray-600 hover:text-gray-800 font-bold flex items-center"
                  onClick={() => navigate(-1)}
                >
                  <FaArrowLeft className="mr-2" />
                  Voltar
                </button>

                <div className="flex gap-4">
                  <FaEdit
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    size={22}
                    title="Atualizar Cliente"
                    onClick={() => abrirEditarCliente()}
                  />
                  <FaTrash
                    className="text-red-500 hover:text-red-800 cursor-pointer"
                    size={22}
                    title="Deletar Cliente"
                    onClick={() => abrirModalDeletar()}
                  />
                </div>
              </div>

              <h2 className="mt-4 sm:mt-0 text-left sm:text-center text-lg sm:text-xl font-semibold ">
                Detalhes do Cliente #{cliente.id}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-sm sm:text-base">
              
              <div className="space-y-2">
                <p>
                  <strong>Nome:</strong>{" "}
                  <span className="text-gray-700">{cliente.nome}</span>
                </p>
                <p>
                  <strong>CPF/CNPJ:</strong>{" "}
                  <span className="text-gray-700">{cliente.cpf_cnpj}</span>
                </p>
                <p>
                  <strong>Tipo de Cliente:</strong>{" "}
                  <span className="text-gray-700">
                    {cliente.tipo_cliente.nome}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <p>
                  <strong>Observaçoes:</strong>{" "}
                  <span className="text-gray-700">{cliente.observacoes}</span>
                </p>
              </div>
            </div>
          </Card>

          <div className="flex flex-col lg:flex-row gap-5">
            {podeTerImovel && (
              <Card className="flex-1">
                <div className="flex justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold ">
                    Imoveis
                  </h2>

                  <div className="flex justify-end">
                    <Button className="flex items-center gap-2" onClick={() => abrirAddImovel()}>
                      <BsHouseAdd />
                      <span className="hidden sm:inline">Adicionar Imovel</span>
                    </Button>
                  </div>
                </div>

                {cliente.imoveis.length === 0 ? (
                  <p className="text-gray-500">Nenhum imóvel cadastrado.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-6 mt-8 text-sm sm:text-base">
                    {cliente.imoveis.map((imovel) => (
                      <div key={imovel.id} className="relative border rounded-xl p-5 bg-white shadow">
                        <span className={`absolute top-0 right-0 px-2 py-1 text-xs font-semibold rounded-bl-lg rounded-tr-lg shadow-sm ${statusImovelStyles[imovel.status] || "bg-gray-100 text-gray-600"}`}>
                          {imovel.status.charAt(0).toUpperCase() + imovel.status.slice(1)}
                        </span>
                        <p className="mr-16"><strong>Endereço:</strong> {imovel.logradouro} n°{imovel.numero}, {imovel.bairro}, {imovel.cidade} - {imovel.estado}</p>
                        {imovel.complemento ? <p><strong>Complemento:</strong> {imovel.complemento}</p> : <></>}
                        <p><strong>CEP:</strong> {imovel.cep}</p>
                        <p><strong>Tipo:</strong> {imovel.tipo_imovel}</p>
                        <p><strong>Área:</strong> {imovel.area_m2} m²</p>
                        {imovel.descricao ? <p><strong>Descrição:</strong> {imovel.descricao}</p> : <></>}

                        <div className="flex gap-2 lg:gap-4 absolute top-12 right-4">
                          <FaEdit
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            size={22}
                            title="Editar Imovel"
                            onClick={() => abrirEditarImovel(imovel)}
                          />
                          <FaTrash
                            className="text-red-500 hover:text-red-800 cursor-pointer"
                            size={22}
                            title="Apagar Imovel"
                            onClick={() => abrirModalDeletar(imovel)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
            
            <Card className="flex-1">
              <div className="flex justify-between">
                <h2 className="text-lg sm:text-xl font-semibold ">
                  Arquivos
                </h2>
              </div>

              {arquivos.length === 0 ? (
                <p className="text-gray-500 mt-8">Nenhum arquivo com este cliente</p>
              ) : (
                <div className="grid grid-cols-1 gap-6 mt-8 text-sm sm:text-base">
                  {arquivos.map((arquivo) => (
                    <div key={arquivo.id} onClick={() => navigate(`/arquivos/${arquivo.id}`)} className="relative border rounded-xl p-5 bg-white shadow cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-blue-400">
                        <div className="flex gap-2 absolute top-3 right-3 text-xs font-semibold">
                          <p className={`text-xs font-semibold ${statusArquivoStyles[arquivo.status]?.text || "text-green-700"}`}>{arquivo.status.charAt(0).toUpperCase() + arquivo.status.slice(1)}</p>
                          <span className={`px-2 py-0 rounded-full ${statusArquivoStyles[arquivo.status]?.bg || "bg-gray-100 text-gray-600"}`} />
                        </div>
                      <p><strong>Locador:</strong> {arquivo.locador_nome}</p>
                      <p><strong>Locatario:</strong> {arquivo.locatario_nome}</p>
                      <p><strong>Imovel:</strong> {arquivo.imovel_locado}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
        <Footer />
      </div>

      <Modal isOpen={modalEditClienteOpen} onClose={() => {setModalEditClienteOpen(false); setErro("");}}>
        <h2 className="text-lg font-semibold mb-3">
          Editar Cliente
        </h2>

        <form onSubmit={editarCliente}>
          <Input
            label="Nome"
            value={formCliente.nome}
            onChange={(e) => setFormCliente({ ...formCliente, nome: e.target.value })}
          />

          <Input
            label="CPF / CNPJ"
            value={formCliente.cpf_cnpj}
            onChange={(e) => setFormCliente({ ...formCliente, cpf_cnpj: maskCpfCnpj(e.target.value) })}
          />

          <Input
            label="observacoes"
            value={formCliente.observacoes}
            onChange={(e) => setFormCliente({ ...formCliente, observacoes: e.target.value })}
          />

          <Select
            label="Tipo"
            value={formCliente.tipo_cliente_id}
            onChange={(e) => setFormCliente({ ...formCliente, tipo_cliente_id: Number(e.target.value) })}
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

      <Modal isOpen={modalDeleteOpen} onClose={() => {setModalDeleteOpen(false); setErro("");}}>
        <h2 className="text-lg font-semibold mb-3">
          {delImovelId ? `Apagar o imovel #${delImovelId}?` : `Excluir o cliente ${cliente.nome.split(" ")[0]}?`}
        </h2>
        <p>Essa ação não poderá ser desfeita.</p>
        {erro && (<div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-3">{erro}</div>)}
        <div className="flex gap-2 mt-4">
          <Button onClick={() => {setModalDeleteOpen(false); setErro("")}}>
            Cancelar
          </Button>

          <Button className="bg-red-600 hover:bg-red-700" onClick={deletarImovelOuCliente}>
            Deletar
          </Button>
        </div>
      </Modal>

      <Modal isOpen={modalImovelOpen} onClose={() => {setModalImovelOpen(false); setErro("");}}>
        <h2 className="text-lg font-semibold mb-3">
          {editImovelId ? "Alterar Imovel" : "Adicionar Imovel"}
        </h2>

        <form onSubmit={salvarImovel}>
          <div className="flex flex-col sm:flex-row sm:gap-5">
            <div className="flex-1">
              <Select label="Tipo de Imovel"
                required
                value={formImovel.tipo_imovel}
                onChange={(e) => setFormImovel({ ...formImovel, tipo_imovel: e.target.value })}
              >
                <option value="">Selecione</option>
                <option value="residencial">Residencial</option>
                <option value="comercial">Comercial</option>
              </Select>
            </div>
            <div className="sm:w-40">
              <Input label="CEP"
                required
                type="text"
                inputMode="numeric"
                value={formatarCep(formImovel.cep)}
                onChange={(e) => setFormImovel({ ...formImovel, cep: e.target.value.replace(/\D/g, "") })}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:gap-5">
            <div className="flex-1">
              <Input label="Logradouro"
                value={formImovel.logradouro}
                onChange={(e) => setFormImovel({ ...formImovel, logradouro: e.target.value })}
              />
            </div>
            <div className="sm:w-28">
              <Input label="Numero"
                type="number"
                value={formImovel.numero}
                onChange={(e) => setFormImovel({ ...formImovel, numero: e.target.value })}
              />
            </div>
          </div>

          <Input label="Bairro"
            value={formImovel.bairro}
            onChange={(e) => setFormImovel({ ...formImovel, bairro: e.target.value })}
          />

          <div className="flex flex-col sm:flex-row sm:gap-5">
            <div className="flex-1">
              <Input label="Cidade"
                value={formImovel.cidade}
                onChange={(e) => setFormImovel({ ...formImovel, cidade: e.target.value })}
              />
            </div>
            <div className="sm:w-24">
              <Input label="Estado"
                maxLength={2}
                value={formImovel.estado}
                onChange={(e) => setFormImovel({ ...formImovel, estado: e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2)})}
              />
            </div>
          </div>

          <Input label="Complemento"
            value={formImovel.complemento}
            onChange={(e) => setFormImovel({ ...formImovel, complemento: e.target.value })}
          />

          <div className="flex flex-col sm:flex-row sm:gap-5">
            <div className="flex-1">
              <Select label="Status"
                required
                value={formImovel.status}
                onChange={(e) => setFormImovel({ ...formImovel, status: e.target.value })}
              >
                <option value="">Selecione</option>
                <option value="disponivel">Disponivel</option>
                <option value="alugado">Alugado</option>
                <option value="inativo">Inativo</option>
              </Select>
            </div>
            <div className="sm:w-40">
              <Input label="Area"
                type="number"
                value={formImovel.area_m2}
                onChange={(e) => setFormImovel({ ...formImovel, area_m2: Number(e.target.value) })}
                />
            </div>
          </div>

          {erro && (<div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-3">{erro}</div>)}
          <Button type="submit" className="mt-4 w-full">
            Salvar
          </Button>
        </form>
      </Modal>
    </div>
  );
}
