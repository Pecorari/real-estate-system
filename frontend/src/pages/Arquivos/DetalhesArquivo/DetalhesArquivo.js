import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";
import Sidebar from "../../../components/layout/Sidebar";
import Card from "../../../components/ui/Card";
import api from "../../../hooks/useApi";
import { FaArrowLeft, FaEdit, FaTrash, FaFileDownload  } from "react-icons/fa";
import { Button } from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import ModalArquivo from "../ModalArquivo";
import Select from "../../../components/ui/Select";

export default function ArquivoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [arquivo, setArquivo] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [modalAtualizarOpen, setModalAtualizarOpen] = useState(false);
  const [modalDeletarOpen, setModalDeletarOpen] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [modalDeletarDocumentoOpen, setModalDeletarDocumentoOpen] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState(null);

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  const formatarData = (dataStr) => {
    if (!dataStr) return "—";
    const data = new Date(dataStr);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const carregarTiposDocumento = async () => {
    try {
      const response = await api.get("/tipo-doc");

      if (Array.isArray(response.data)) {
        setTiposDocumento(response.data);
      } else {
        setTiposDocumento([]);
      }
    } catch (err) {
      console.error("Erro ao carregar tipos de documento:", err);
    }
  };

  const carregarArquivo = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/arquivos`);
      const arquivoSelecionado = data.find((a) => a.id === Number(id));
      setArquivo(arquivoSelecionado);
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
    carregarTiposDocumento();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDeletarArquivo = async () => {
    if (!window.confirm("Deseja realmente deletar este arquivo?")) return;

    try {
      await api.delete(`/arquivos/${id}`);
      navigate("/arquivos");
    } catch (err) {
      console.error("Erro ao deletar arquivo:", err);
    } finally {
      setModalDeletarOpen(false);
    }
  };

  const handleUploadDocumento = async () => {
    if (!uploadFile) return;
    if (!tipoSelecionado) return;

    try {
      const formData = new FormData();
      formData.append("documento", uploadFile);
      formData.append("tipo_documento_id", tipoSelecionado);

      await api.post(`/arquivos/${id}/documentos`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadFile(null);
      setTipoSelecionado("");
      carregarDocumentos();
    } catch (err) {
      console.error("Erro ao enviar documento:", err);
    }
  };

  const handleDownloadDocumento = async (docId) => {
    try {
      const response = await api.get(`/arquivos/${id}/documentos/${docId}/download`, { responseType: "blob" });

      const fileName = response.headers["x-file-name"];

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;

      link.click();

    } catch (err) {
      console.error("Erro ao baixar documento:", err);
    }
  };

  const handleDeletarDocumento = async (docId) => {
    try {
      await api.delete(`/arquivos/${id}/documentos/${docId}/delete`);
      console.log(id, docId);
      carregarDocumentos();
    } catch (err) {
      console.error("Erro ao deletar documento:", err);
    } finally {
      setModalDeletarDocumentoOpen(false);
      setDocumentoSelecionado(null);
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
            <div className="flex items-center justify-between mb-4">
              <button
                className="text-gray-600 hover:text-gray-800 font-bold flex items-center"
                onClick={() => navigate("/arquivos")}
              >
                <FaArrowLeft className="mr-2" /> Voltar
              </button>

              <h2 className="text-xl font-semibold">Detalhes do Arquivo #{arquivo.id}</h2>

              <div className="flex space-x-2">
                <FaEdit
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  size={25}
                  title="Atualizar Arquivo"
                  onClick={() => setModalAtualizarOpen(true)}
                />
                <FaTrash
                  className="text-red-500 hover:text-red-600 cursor-pointer"
                  size={25}
                  title="Deletar Arquivo"
                  onClick={() => setModalDeletarOpen(true)}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row mb-4 gap-6 mt-12">
              <div className="flex-1 flex flex-col space-y-2">
                <p><strong>Locador:</strong> {arquivo.locador_nome}</p>
                <p><strong>Locatário:</strong> {arquivo.locatario_nome}</p>
                <p><strong>Status:</strong> {capitalize(arquivo.status)}</p>
              </div>

              <div className="flex-1 flex flex-col space-y-2">
                <p><strong>Data Início:</strong> {formatarData(arquivo.data_inicio)}</p>
                <p><strong>Data Fim:</strong> {formatarData(arquivo.data_fim) || "—"}</p>
                <p><strong>Observações:</strong> {arquivo.observacoes || "—"}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4">Documentos</h3>

            <div className="flex items-center space-x-2 mb-4">
              <Select
                label="Tipo do Documento"
                value={tipoSelecionado}
                onChange={(e) => setTipoSelecionado(e.target.value)}
              >
                <option value="">Selecione o tipo de Documento</option>

                {Array.isArray(tiposDocumento) && tiposDocumento.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                ))}
              </Select>
              <input type="file" onChange={(e) => setUploadFile(e.target.files[0])} />
              <Button onClick={handleUploadDocumento}>Enviar Documento</Button>
            </div>

            <table className="min-w-full bg-white rounded shadow text-sm">
              <thead className="bg-gray-200 text-left">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2">Nome</th>
                  <th className="px-4 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map((doc) => (
                  <tr key={doc.id} className="border-t">
                    <td className="px-4 py-2">{doc.id}</td>
                    <td className="px-4 py-2">{doc.tipo_documento_id}</td>
                    <td className="px-4 py-2">{doc.nome}</td>
                    <td className="px-4 py-2 space-x-2">
                      <FaFileDownload
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        size={18}
                        title="Download"
                        onClick={() => handleDownloadDocumento(doc.id)}
                      />
                      <FaTrash
                        className="text-red-500 hover:text-red-600 cursor-pointer"
                        size={18}
                        title="Deletar Documento"
                        onClick={() => {
                          setDocumentoSelecionado(doc.id);
                          setModalDeletarDocumentoOpen(true);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <ModalArquivo
          open={modalAtualizarOpen}
          onClose={() => setModalAtualizarOpen(false)}
          onCreated={carregarArquivo}
          arquivo={arquivo}
        />

        <Modal isOpen={modalDeletarOpen} onClose={() => setModalDeletarOpen(false)} title="Confirmar exclusão">
          <p>Deseja realmente deletar este arquivo?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={() => setModalDeletarOpen(false)}>Cancelar</Button>
            <Button className="bg-red-500 hover:bg-red-600" onClick={handleDeletarArquivo}>
              Deletar
            </Button>
          </div>
        </Modal>

        <Modal isOpen={modalDeletarDocumentoOpen} onClose={() => setModalDeletarDocumentoOpen(false)} title="Confirmar exclusão do documento">
          <p>Deseja realmente deletar este documento?</p>

          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={() => setModalDeletarDocumentoOpen(false)}>
              Cancelar
            </Button>

            <Button 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => handleDeletarDocumento(documentoSelecionado)}
            >
              Deletar
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
