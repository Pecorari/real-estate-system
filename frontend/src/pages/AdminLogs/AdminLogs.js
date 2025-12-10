import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import Footer from "../../components/layout/Footer";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import TableHistorico from "../../components/ui/TableHistorico";
import api from "../../hooks/useApi";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtros, setFiltros] = useState({
    usuario_id: "",
    acao: "",
    entidade: "",
    entidade_id: "",
    data_ini: "",
    data_fim: ""
  });

  const getLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/logs", { params: filtros });

      const formatados = response.data.map((log) => ({
        data: new Date(log.created_at).toLocaleString("pt-BR"),
        id: log.id,
        usuario: log.usuario_nome,
        acao: log.acao,
        entidade: log.entidade,
        entidade_id: log.entidade_id || "-",
        descricao: log.descricao,
      }));

      setLogs(formatados);
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
      getLogs();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiltro = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const aplicarFiltros = () => getLogs();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <Navbar />

        <div className="p-6 flex-1">
          <div className="bg-white p-4 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">Logs do Sistema</h1>

            <div className="flex flex-wrap mb-4">
              <Input
                name="usuario_id"
                value={filtros.usuario_id}
                onChange={handleFiltro}
                placeholder="ID do Usuário"
                className="p-2 rounded bg-gray-700 text-white w-full sm:w-[48%] lg:w-[23%]"
              />

              <Select
                name="acao"
                value={filtros.acao}
                onChange={handleFiltro}
                className="p-2 rounded bg-gray-700 text-white w-full sm:w-[48%] lg:w-[23%]"
              >
                <option value="">Ação</option>
                <option value="criação">Criação</option>
                <option value="edição">Edição</option>
                <option value="deleção">Deleção</option>
                <option value="login">Login</option>
              </Select>

              <Select
                name="entidade"
                value={filtros.entidade}
                onChange={handleFiltro}
                className="p-2 rounded bg-gray-700 text-white w-full sm:w-[48%] lg:w-[23%]"
              >
                <option value="">Entidade</option>
                <option value="cliente">Cliente</option>
                <option value="arquivo">Arquivo</option>
                <option value="documento">Documento</option>
                <option value="usuario">Usuário</option>
              </Select>

              <Input
                name="entidade_id"
                value={filtros.entidade_id}
                onChange={handleFiltro}
                placeholder="ID da Entidade"
                className="p-2 rounded bg-gray-700 text-white w-full sm:w-[48%] lg:w-[23%]"
              />

              <Input
                type="date"
                name="data_ini"
                value={filtros.data_ini}
                onChange={handleFiltro}
                className="p-2 rounded bg-gray-700 text-white w-full sm:w-[48%] lg:w-[23%]"
              />

              <Input
                type="date"
                name="data_fim"
                value={filtros.data_fim}
                onChange={handleFiltro}
                className="p-2 rounded bg-gray-700 text-white w-full sm:w-[48%] lg:w-[23%]"
              />

              <Button className="self-end" onClick={aplicarFiltros}>Aplicar Filtros</Button>
            </div>

            {loading ? (
              <p className="text-gray-500">Carregando...</p>
            ) : logs.length === 0 ? (
                <p className="text-gray-500">Nenhum log encontrado.</p>
            ) : (
              <TableHistorico
                columns={[
                  "Data",
                  "ID",
                  "Usuário",
                  "Ação",
                  "Entidade",
                  "Entidade ID",
                  "Descrição",
                ]}
                data={logs}
              />
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AdminLogs;
