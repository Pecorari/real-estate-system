import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";
import Sidebar from "../../../components/layout/Sidebar";
import Card from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import api from "../../../hooks/useApi";

export default function ArquivoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [arquivo, setArquivo] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoStatus, setNovoStatus] = useState("");
  const [uploadFile, setUploadFile] = useState(null);

  const carregarArquivo = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/arquivos`);
      const arquivoSelecionado = data.find((a) => a.id === Number(id));
      setArquivo(arquivoSelecionado);
      setNovoStatus(arquivoSelecionado?.status || "");
    } catch (err) {
      console.error("Erro ao carregar arquivo:", err);
    } finally {
      setLoading(false);
    }
  };

  const carregarDocumentos = async () => {
    try {
      const { data } = await api.get(`/arquivos/${id}/documentos`);
      setDocumentos(data);
    } catch (err) {
      console.error("Erro ao carregar documentos:", err);
    }
  };

  useEffect(() => {
    carregarArquivo();
    carregarDocumentos();
  }, [id]);

  const handleAtualizarArquivo = async () => {
    try {
      await api.put(`/arquivos/${id}`, { ...arquivo, status: novoStatus });
      alert("Arquivo atualizado com sucesso!");
      carregarArquivo();
    } catch (err) {
      console.error("Erro ao atualizar arquivo:", err);
    }
  };

  const handleDeletarArquivo = async () => {
    if (!window.confirm("Deseja realmente deletar este arquivo?")) return;
    try {
      await api.delete(`/arquivos/${id}`);
      alert("Arquivo deletado com sucesso!");
      navigate("/arquivos");
    } catch (err) {
      console.error("Erro ao deletar arquivo:", err);
    }
  };

  const handleUploadDocumento = async () => {
    if (!uploadFile) return;
    try {
      const formData = new FormData();
      formData.append("documento", uploadFile);

      await api.post(`/arquivos/${id}/documentos`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Documento enviado com sucesso!");
      setUploadFile(null);
      carregarDocumentos();
    } catch (err) {
      console.error("Erro ao enviar documento:", err);
    }
  };

  const handleDownloadDocumento = (docId, nomeArquivo) => {
    window.open(`/arquivos/${id}/documentos/${docId}/download`, "_blank");
  };

  const handleDeletarDocumento = async (docId) => {
    if (!window.confirm("Deseja realmente deletar este documento?")) return;
    try {
      await api.delete(`/arquivos/${id}/documentos/${docId}/delete`);
      alert("Documento deletado com sucesso!");
      carregarDocumentos();
    } catch (err) {
      console.error("Erro ao deletar documento:", err);
    }
  };

  if (loading || !arquivo) return <p className="p-6">Carregando...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Navbar />

        <div className="p-6 space-y-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Detalhes do Arquivo #{arquivo.id}</h2>
            
            <div className="flex flex-col space-y-2 mb-4">
              <p><strong>Locador:</strong> {arquivo.locador_nome}</p>
              <p><strong>Locatário:</strong> {arquivo.locatario_nome}</p>
              <p><strong>Data Início:</strong> {arquivo.data_inicio}</p>
              <p><strong>Data Fim:</strong> {arquivo.data_fim || "—"}</p>
              <div className="flex items-center space-x-2">
                <span>Status:</span>
                <Input value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)} />
                <Button onClick={handleAtualizarArquivo}>Atualizar</Button>
                <Button className="bg-red-500 hover:bg-red-600" onClick={handleDeletarArquivo}>
                  Deletar Arquivo
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4">Documentos</h3>

            <div className="flex items-center space-x-2 mb-4">
              <input type="file" onChange={(e) => setUploadFile(e.target.files[0])} />
              <Button onClick={handleUploadDocumento}>Enviar Documento</Button>
            </div>

            <table className="min-w-full bg-white rounded shadow text-sm">
              <thead className="bg-gray-200 text-left">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Nome</th>
                  <th className="px-4 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map((doc) => (
                  <tr key={doc.id} className="border-t">
                    <td className="px-4 py-2">{doc.id}</td>
                    <td className="px-4 py-2">{doc.nome_original}</td>
                    <td className="px-4 py-2 space-x-2">
                      <Button onClick={() => handleDownloadDocumento(doc.id, doc.nome_original)}>
                        Download
                      </Button>
                      <Button
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => handleDeletarDocumento(doc.id)}
                      >
                        Deletar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}
