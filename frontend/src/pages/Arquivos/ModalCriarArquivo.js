import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import api from "../../hooks/useApi";

export default function ModalCriarArquivo({ open, onClose, onCreated }) {
  const [locadores, setLocadores] = useState([]);
  const [locatarios, setLocatarios] = useState([]);

  const [form, setForm] = useState({
    cliente_locador_id: "",
    cliente_locatario_id: "",
    data_inicio: "",
    data_fim: "",
    status: "ativo",
    observacoes: ""
  });

  useEffect(() => {
    if (open) carregarClientes();
  }, [open]);

  const carregarClientes = async () => {
    const locs = await api.get("/search/clientes?tipo=locador");
    const lcts = await api.get("/search/clientes?tipo=locatario");
    setLocadores(locs.data);
    setLocatarios(lcts.data);
  };

  const atualizar = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
  };

  const salvar = async () => {
    try {
      await api.post("/arquivos", form);
      onCreated();     
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao criar arquivo");
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4">Criar Arquivo</h2>

      <Select
        label="Locador"
        value={form.cliente_locador_id}
        onChange={(e) => atualizar("cliente_locador_id", e.target.value)}
      >
        <option value="">Selecione o locador</option>
        {locadores.map((c) => (
          <option key={c.id} value={c.id}>{c.nome}</option>
        ))}
      </Select>

      <Select
        label="Locatário"
        value={form.cliente_locatario_id}
        onChange={(e) => atualizar("cliente_locatario_id", e.target.value)}
      >
        <option value="">Selecione o locatário</option>
        {locatarios.map((c) => (
          <option key={c.id} value={c.id}>{c.nome}</option>
        ))}
      </Select>

      <Input
        label="Data Início"
        type="date"
        value={form.data_inicio}
        onChange={(e) => atualizar("data_inicio", e.target.value)}
      />

      <Input
        label="Data Fim"
        type="date"
        value={form.data_fim}
        onChange={(e) => atualizar("data_fim", e.target.value)}
      />

      <Select
        label="Status"
        value={form.status}
        onChange={(e) => atualizar("status", e.target.value)}
      >
        <option value="ativo">Ativo</option>
        <option value="encerrado">Encerrado</option>
        <option value="inadimplente">Inadimplente</option>
      </Select>

      <Input
        label="Observações"
        value={form.observacoes}
        onChange={(e) => atualizar("observacoes", e.target.value)}
      />

      <div className="flex justify-end mt-4 gap-2">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={salvar}>Salvar</Button>
      </div>
    </Modal>
  );
}
