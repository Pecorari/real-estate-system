import React, { useEffect, useState } from "react";
import api from "../../hooks/useApi";

import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    tipo: "user",
  });

  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const carregarUsuarios = async () => {
    try {
      const { data } = await api.get("/usuarios");
      setUsuarios(data);
    } catch (err) {
      console.log("Erro ao carregar usuários", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const abrirCriar = () => {
    setForm({
      nome: "",
      email: "",
      senha: "",
      tipo: "user",
    });
    setEditId(null);
    setModalOpen(true);
  };

  const abrirEditar = (user) => {
    setEditId(user.id);
    setForm({
      nome: user.nome,
      email: user.email,
      senha: "",
      tipo: user.role,
    });
    setModalOpen(true);
  };

  const salvarUsuario = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        // UPDATE
        await api.put(`/usuarios/${editId}`, form);
      } else {
        // CREATE
        console.log(form);
        await api.post("/usuarios", form);
      }

      setModalOpen(false);
      carregarUsuarios();
    } catch (err) {
      console.log("Erro ao salvar usuário:", err);
    }
  };

  const deletarUsuario = async () => {
    try {
      await api.delete(`/usuarios/${deleteId}`);
      setDeleteId(null);
      setModalDeleteOpen(false);
      carregarUsuarios();
    } catch (err) {
      console.log("Erro ao deletar", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-semibold">Usuários</h1>

              <Button onClick={abrirCriar}>+ Novo Usuário</Button>
            </div>

            {loading ? (
              <p>Carregando...</p>
            ) : (
              <Table
                columns={["ID", "Nome", "Email", "Tipo", "Ações"]}
                data={usuarios.map((u) => ({
                  id: u.id,
                  nome: u.nome,
                  email: u.email,
                  tipo: u.role,
                  ações: (
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirEditar(u)}
                        className="text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(u.id);
                          setModalDeleteOpen(true);
                        }}
                        className="text-red-600 hover:underline"
                      >
                        Deletar
                      </button>
                    </div>
                  ),
                }))}
              />
            )}
          </Card>
        </main>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-lg font-semibold mb-3">
          {editId ? "Editar Usuário" : "Novo Usuário"}
        </h2>

        <form onSubmit={salvarUsuario}>
          <Input
            label="Nome"
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />

          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          {!editId && (
            <Input
              label="Senha"
              type="password"
              required
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
            />
          )}

          <select
            className="border rounded px-3 py-2 w-full mt-2"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            <option value="admin">Administrador</option>
            <option value="user">Usuario</option>
          </select>

          <Button className="mt-4 w-full" type="submit">
            Salvar
          </Button>
        </form>
      </Modal>

      <Modal isOpen={modalDeleteOpen} onClose={() => setModalDeleteOpen(false)}>
        <h2 className="text-lg font-semibold mb-4">Excluir usuário?</h2>
        <p>Essa ação não poderá ser desfeita.</p>

        <div className="flex gap-2 mt-4">
          <Button
            className="bg-gray-400 hover:bg-gray-500"
            onClick={() => setModalDeleteOpen(false)}
          >
            Cancelar
          </Button>

          <Button className="bg-red-600 hover:bg-red-700" onClick={deletarUsuario}>
            Deletar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
