import { useEffect, useState } from "react";
import api from "../../hooks/useApi";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import titleCase from "../../utils/formatarTitleCase";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import Footer from "../../components/layout/Footer";

export default function TipoCliente() {
    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalDeleteOpen, setModalDeleteOpen] = useState(false);

    const [form, setForm] = useState({ nome: "" });
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const carregarTipos = async () => {
        try {
            const { data } = await api.get("/tipo-cli");

            const formatados = data.map(tipo => ({
                ...tipo,
                nome: titleCase(tipo.nome)
            }))

            setTipos(formatados);
        } catch (err) {
            console.log("Erro ao carregar tipos de clientes", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarTipos();
    }, []);

    const abrirCriar = () => {
        setForm({ nome: "" });
        setEditId(null);
        setModalOpen(true);
    };

    const abrirEditar = (tipo) => {
        setEditId(tipo.id);
        setForm({ nome: tipo.nome });
        setModalOpen(true);
    };

    const salvarTipo = async (e) => {
        e.preventDefault();

        try {
            if (editId) {
                await api.put(`/tipo-cli/${editId}`, form);
            } else {
                await api.post("/tipo-cli", form);
            }

            setModalOpen(false);
            carregarTipos();
        } catch (err) {
            console.log("Erro ao salvar tipo de cliente:", err);
        }
    };

    const deletarTipo = async () => {
        try {
            await api.delete(`/tipo-cli/${deleteId}`);
            setDeleteId(null);
            setModalDeleteOpen(false);
            carregarTipos();
        } catch (err) {
            console.log("Erro ao deletar tipo de cliente", err);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-auto">
                <Navbar />
                <main className="p-6 flex-1">
                    <Card>
                        <div className="flex flex-row items-center justify-between gap-4 mb-6">
                            <h1 className="text-xl sm:text-2xl font-bold text-left">Tipos de Cliente</h1>
                            <Button onClick={abrirCriar} className="w-min">
                                <FaPlus />
                                <span className="hidden md:inline">Novo Tipo</span>
                            </Button>
                        </div>

                        {loading ? (
                            <p>Carregando...</p>
                        ) : (
                        <Table
                            columns={["Nome", "Ações"]}
                            data={tipos.map((t) => ({
                            nome: t.nome,
                            ações: (
                                <div className="flex gap-2">
                                    <button onClick={() => abrirEditar(t)} className="text-blue-600 hover:underline">
                                        <FaEdit
                                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                            size={20}
                                            title="Editar Tipo de cliente"
                                        />
                                    </button>
                                    <p className="text-gray-400"> | </p>
                                    <button onClick={() => {
                                        setDeleteId(t.id);
                                        setModalDeleteOpen(true);
                                    }} className="text-red-600 hover:underline"
                                    >
                                        <FaTrash
                                            className="text-red-500 hover:text-red-800 cursor-pointer"
                                            size={20}
                                            title="Deletar Tipo de cliente"
                                        />
                                    </button>
                                </div>
                            ),
                            }))}
                        />
                        )}
                    </Card>
                </main>
                <Footer />
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
                <h2 className="text-lg font-semibold mb-3">
                    {editId ? "Editar Tipo" : "Novo Tipo"}
                </h2>

                <form onSubmit={salvarTipo}>
                    <Input
                        label="Nome"
                        required
                        value={form.nome}
                        onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    />

                    <Button className="mt-4 w-full" type="submit">
                        Salvar
                    </Button>
                </form>
            </Modal>

            <Modal isOpen={modalDeleteOpen} onClose={() => setModalDeleteOpen(false)}>
                <h2 className="text-lg font-semibold mb-4">Excluir tipo de cliente?</h2>
                <p>Essa ação não poderá ser desfeita.</p>

                <div className="flex gap-2 mt-4">
                    <Button
                        className="bg-gray-400 hover:bg-gray-500"
                        onClick={() => setModalDeleteOpen(false)}
                    >
                        Cancelar
                    </Button>

                    <Button className="bg-red-600 hover:bg-red-700" onClick={deletarTipo}>
                        Deletar
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
