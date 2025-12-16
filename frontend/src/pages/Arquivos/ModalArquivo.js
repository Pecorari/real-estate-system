import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import maskCpfCnpj from "../../utils/formatarCpfCnpj";

import api from "../../hooks/useApi";

export default function ModalArquivo({ open, onClose, onCreated, arquivo }) {
  const [buscaLocador, setBuscaLocador] = useState("");
  const [listaLocadorBusca, setListaLocadorBusca] = useState([]);

  const [buscaLocatario, setBuscaLocatario] = useState("");
  const [listaLocatarioBusca, setListaLocatarioBusca] = useState([]);

  const [form, setForm] = useState({
    cliente_locador_id: "",
    cliente_locatario_id: "",
    data_inicio: "",
    data_fim: "",
    status: "ativo",
    observacoes: ""
  });

const pesquisarLocador = async (value) => {
  const q = tratarBuscaCpfNome(value, setBuscaLocador);

  if (!q || q.length < 2) {
    setListaLocadorBusca([]);
    return;
  }

  try {
    const { data } = await api.get("/clientes", {
      params: { q }
    });

    const filtrados = data.data.filter(
      (c) => c.tipo === "locador" || c.tipo === "ambos"
    );

    setListaLocadorBusca(filtrados);
  } catch {
    setListaLocadorBusca([]);
  }
};


const pesquisarLocatario = async (value) => {
  const q = tratarBuscaCpfNome(value, setBuscaLocatario);

  if (!q || q.length < 2) {
    setListaLocatarioBusca([]);
    return;
  }

  try {
    const { data } = await api.get("/clientes", {
      params: { q }
    });

    const filtrados = data.data.filter(
      (c) => c.tipo === "locatario" || c.tipo === "ambos"
    );

    setListaLocatarioBusca(filtrados);
  } catch {
    setListaLocatarioBusca([]);
  }
};

  useEffect(() => {
    if (arquivo) {
      setForm({
        cliente_locador_id: arquivo.cliente_locador_id || "",
        cliente_locatario_id: arquivo.cliente_locatario_id || "",
        data_inicio: arquivo.data_inicio ? arquivo.data_inicio.split("T")[0] : "",
        data_fim: arquivo.data_fim ? arquivo.data_fim.split("T")[0] : "",
        status: arquivo.status || "ativo",
        observacoes: arquivo.observacoes || ""
      });

      setBuscaLocador(arquivo.locador_nome || "");
      setBuscaLocatario(arquivo.locatario_nome || "");
    } else {
      setForm({
        cliente_locador_id: "",
        cliente_locatario_id: "",
        data_inicio: "",
        data_fim: "",
        status: "ativo",
        observacoes: ""
      });
      
      setBuscaLocador("");
      setBuscaLocatario("");
    }
  }, [arquivo]);

  const atualizar = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
  };

  const salvar = async () => {
    try {
      if (arquivo?.id) {
        await api.put(`/arquivos/${arquivo.id}`, form);
      } else {
        await api.post("/arquivos", form);
      }
      onCreated();     
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar arquivo");
    }
  };

  const tratarBuscaCpfNome = (value, setBusca) => {
    const apenasNumeros = value.replace(/\D/g, "");
    const temLetra = /[a-zA-Z]/.test(value);

    if (temLetra) {
      setBusca(value);
      return value;
    }

    if (apenasNumeros.length <= 14) {
      const mascarado = maskCpfCnpj(apenasNumeros);
      setBusca(mascarado);
      return apenasNumeros;
    }

    return null;
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4">
        {arquivo?.id ? "Atualizar Arquivo" : "Criar Arquivo"}
      </h2>

      <div className="relative mb-3">
        <Input
          label="Locador (pesquise por nome ou CPF)"
          value={buscaLocador}
          onChange={(e) => pesquisarLocador(e.target.value)}
          placeholder="Digite para buscar..."
        />

        {listaLocadorBusca.length > 0 && (
          <div className="absolute bg-white border rounded w-full max-h-40 overflow-auto z-10 shadow">
            {listaLocadorBusca.map((c) => (
              <div
                key={c.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  atualizar("cliente_locador_id", c.id);
                  setBuscaLocador(c.nome);
                  setListaLocadorBusca([]);
                }}
              >
                {c.nome} — {c.cpf_cnpj}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative mb-3">
        <Input
          label="Locatário (pesquise por nome ou CPF)"
          value={buscaLocatario}
          onChange={(e) => pesquisarLocatario(e.target.value)}
          placeholder="Digite para buscar..."
        />

        {listaLocatarioBusca.length > 0 && (
          <div className="absolute bg-white border rounded w-full max-h-40 overflow-auto z-10 shadow">
            {listaLocatarioBusca.map((c) => (
              <div
                key={c.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  atualizar("cliente_locatario_id", c.id);
                  setBuscaLocatario(c.nome);
                  setListaLocatarioBusca([]);
                }}
              >
                {c.nome} — {c.cpf_cnpj}
              </div>
            ))}
          </div>
        )}
      </div>

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
        <Button onClick={salvar}>{arquivo?.id ? "Atualizar" : "Salvar"}</Button>
      </div>
    </Modal>
  );
}
