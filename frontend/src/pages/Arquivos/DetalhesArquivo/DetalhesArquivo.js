import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";
import Sidebar from "../../../components/layout/Sidebar";
import Footer from "../../../components/layout/Footer";
import Card from "../../../components/ui/Card";
import api from "../../../hooks/useApi";
import { FaArrowLeft, FaEdit, FaTrash, FaFileDownload, FaUpload } from "react-icons/fa";
import { Button } from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Table from "../../../components/ui/Table";
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
  const [modalUploadOpen, setModalUploadOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // opcional

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
      const { data } = await api.get(`/arquivos/${id}`);
      setArquivo(data);
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
    if (!uploadFile || !tipoSelecionado) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append("documento", uploadFile);
      formData.append("tipo_documento_id", tipoSelecionado);

      await api.post(`/arquivos/${id}/documentos`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          }
        }
      });

      setUploadFile(null);
      setTipoSelecionado("");
      setModalUploadOpen(false);
      carregarDocumentos();
    } catch (err) {
      console.error("Erro ao enviar documento:", err);
      alert("Erro ao enviar o documento, por favor tente novamente.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownloadDocumento = async (docId) => {
    try {
      const { data } = await api.get(`/arquivos/${id}/documentos/${docId}/download`);
      window.open(data.url, "_blank");
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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) setUploadFile(file);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const documentoColumns = ["ID", "Tipo", "Nome", "Ações"];

  const documentoData = documentos.map((doc) => ({
    id: doc.id,
    tipo: doc.tipo_documento_nome,
    nome: doc.nome_original,
    acoes: (
      <div className="flex space-x-4">
        <FaFileDownload
          className="text-blue-600 hover:text-blue-800 cursor-pointer"
          size={20}
          title="Download"
          onClick={() => handleDownloadDocumento(doc.id)}
        />
        <p className="text-gray-400"> | </p>
        <FaTrash
          className="text-red-500 hover:text-red-600 cursor-pointer"
          size={20}
          title="Deletar Documento"
          onClick={() => {
            setDocumentoSelecionado(doc.id);
            setModalDeletarDocumentoOpen(true);
          }}
        />
      </div>
    ),
  }));

  if (loading || !arquivo) return <p className="p-6">Carregando...</p>;

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
                  onClick={() => navigate("/arquivos")}
                >
                  <FaArrowLeft className="mr-2" />
                  Voltar
                </button>

                <div className="flex gap-4">
                  <FaEdit
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    size={22}
                    title="Atualizar Arquivo"
                    onClick={() => setModalAtualizarOpen(true)}
                  />
                  <FaTrash
                    className="text-red-500 hover:text-red-600 cursor-pointer"
                    size={22}
                    title="Deletar Arquivo"
                    onClick={() => setModalDeletarOpen(true)}
                  />
                </div>
              </div>

              <h2 className="mt-4 sm:mt-0 text-left sm:text-center text-lg sm:text-xl font-semibold ">
                Detalhes do Arquivo #{arquivo.id}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-sm sm:text-base">
              
              <div className="space-y-2">
                <p>
                  <strong>Locador:</strong>{" "}
                  <span className="text-gray-700">{arquivo.locador_nome}</span>
                </p>
                <p>
                  <strong>Locatário:</strong>{" "}
                  <span className="text-gray-700">{arquivo.locatario_nome}</span>
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="text-gray-700">{capitalize(arquivo.status)}</span>
                </p>
              </div>

              <div className="space-y-2">
                <p>
                  <strong>Data Início:</strong>{" "}
                  <span className="text-gray-700">
                    {formatarData(arquivo.data_inicio)}
                  </span>
                </p>
                <p>
                  <strong>Data Fim:</strong>{" "}
                  <span className="text-gray-700">
                    {formatarData(arquivo.data_fim) || "—"}
                  </span>
                </p>
                <p className="break-words">
                  <strong>Observações:</strong>{" "}
                  <span className="text-gray-700">
                    {arquivo.observacoes || "—"}
                  </span>
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4">Documentos</h3>

            <div className="flex justify-end mb-4">
              <Button
                className="flex items-center gap-2"
                onClick={() => setModalUploadOpen(true)}
              >
                <FaUpload />
                Adicionar Documento
              </Button>
            </div>

            <Table
              columns={documentoColumns}
              data={documentoData}
            />
          </Card>
        </div>

        <Modal isOpen={modalUploadOpen} onClose={() => !uploading && setModalUploadOpen(false)} title="Adicionar Documento">
          <div className="space-y-4">

            <Select label="Tipo do Documento" value={tipoSelecionado} onChange={(e) => setTipoSelecionado(e.target.value)}>
              <option value="">Selecione o tipo de Documento</option>
              {tiposDocumento.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
              ))}
            </Select>
              <label
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragLeave={handleDragLeave}
                className={`
                  flex flex-col items-center justify-center
                  border-2 border-dashed rounded-lg
                  p-6 cursor-pointer
                  transition
                  ${dragging ? "border-blue-600 bg-blue-100" : ""}
                  ${uploadFile
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"}
                `}
              >
              <FaUpload className="text-2xl mb-2" />

              <span className="text-sm text-center">
                {uploadFile ? uploadFile.name : "Arraste o arquivo aqui ou clique para selecionar"}
              </span>

              <input
                type="file"
                className="hidden"
                onChange={(e) => setUploadFile(e.target.files[0])}
              />
            </label>

            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            {uploading && (
              <p className="text-sm text-gray-600 text-center">
                Enviando... {uploadProgress}%
              </p>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <button
                disabled={uploading}
                className={`px-4 py-2 rounded transition ${
                  uploading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-800 text-white"
                }`}
                onClick={() => setModalUploadOpen(false)}
              >
                Cancelar
              </button>

              <Button
                disabled={!uploadFile || !tipoSelecionado || uploading}
                onClick={handleUploadDocumento}
              >
                {uploading ? "Enviando..." : "Enviar Documento"}
              </Button>
            </div>
          </div>
        </Modal>

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

        <Footer />
      </div>
    </div>
  );
}
