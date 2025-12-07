const db = require("../config/db_connection");
const { createLog } = require("./logController");

async function getResumoClientes(req, res) {
  try {
    const [[totais]] = await db.execute(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN tipo = 'locador' OR tipo = 'ambos' THEN 1 ELSE 0 END) AS locadores,
        SUM(CASE WHEN tipo = 'locatario' OR tipo = 'ambos' THEN 1 ELSE 0 END) AS locatarios
      FROM clientes
    `);

    res.json({
      total: totais.total || 0,
      locadores: totais.locadores || 0,
      locatarios: totais.locatarios || 0,
    });
  } catch (err) {
    console.error("Erro ao buscar resumo de clientes:", err);
    res.status(500).json({ error: "Erro ao buscar resumo" });
  }
};


async function listarClientes(req, res) {
  try {
    const [rows] = await db.query(`SELECT id, nome, cpf_cnpj, tipo, observacoes, created_at, updated_at FROM clientes ORDER BY id DESC`);

    return res.json(rows);
  } catch (error) {
    console.error("Erro listarClientes:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

async function criarCliente(req, res) {
  try {
    const { nome, cpf_cnpj, tipo, observacoes} = req.body;

    if (!nome || !tipo)
      return res.status(400).json({ error: "Nome e tipo são obrigatórios." });

    if (!["locador", "locatario", "ambos"].includes(tipo.toLowerCase()))
      return res.status(400).json({ error: "Tipo deve ser 'locador', 'locatario' ou 'ambos'." });

    if (!cpf_cnpj)
        return res.status(400).json({ error: "CPF/CNPJ são obrigatórios." });


    const [existeCPF] = await db.query(`SELECT id FROM clientes WHERE cpf_cnpj = ?`, [cpf_cnpj]);

    if (existeCPF.length > 0)
        return res.status(400).json({ error: "Já existe cliente com este CPF/CNPJ." });


    const [result] = await db.query(`INSERT INTO clientes (nome, cpf_cnpj, tipo, observacoes) VALUES (?, ?, ?, ?)`,
      [nome, cpf_cnpj, tipo, observacoes || null]
    );

    await createLog({
      usuario_id: req.usuario.id,
      acao: "Adicionado um cliente",
      entidade: "cliente",
      entidade_id: result.insertId,
      descricao: `Cliente ${nome} criado`
    });

    return res.status(201).json({ message: "Cliente criado com sucesso!",
      cliente: {
        id: result.insertId,
        nome,
        cpf_cnpj,
        tipo,
        observacoes
      }
    });
  } catch (error) {
    console.error("Erro criarCliente:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

async function atualizarCliente(req, res) {
  try {
    const { id } = req.params;
    const {
      nome,
      cpf_cnpj,
      tipo,
      observacoes
    } = req.body;

    const [existe] = await db.query(`SELECT * FROM clientes WHERE id = ?`, [id]);

    if (existe.length === 0)
      return res.status(404).json({ error: "Cliente não encontrado." });

    if (cpf_cnpj && cpf_cnpj !== existe[0].cpf_cnpj) {
      const [existeCPF] = await db.query(`SELECT id FROM clientes WHERE cpf_cnpj = ?`, [cpf_cnpj]);

      if (existeCPF.length > 0)
        return res.status(400).json({ error: "Já existe cliente com este CPF/CNPJ." });
    }

    await db.query(`UPDATE clientes SET nome = ?, tipo = ?, cpf_cnpj = ?, observacoes = ? WHERE id = ?`,
      [
        nome,
        tipo,
        cpf_cnpj,
        observacoes || null,
        id
      ]
    );

    await createLog({
      usuario_id: req.usuario.id,
      acao: "Editado um cliente",
      entidade: "cliente",
      entidade_id: id,
      descricao: `Cliente atualizado: ${nome}`
    });

    return res.json({ message: "Cliente atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro atualizarCliente:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

async function deletarCliente(req, res) {
  try {
    const { id } = req.params;

    const [existe] = await db.query(`SELECT id FROM clientes WHERE id = ?`, [id]);

    if (existe.length === 0)
      return res.status(404).json({ error: "Cliente não encontrado." });

    await db.query(`DELETE FROM clientes WHERE id = ?`, [id]);

    await createLog({
      usuario_id: req.usuario.id,
      acao: "Removido um cliente",
      entidade: "cliente",
      entidade_id: id,
      descricao: "Cliente removido"
    });

    return res.json({ message: "Cliente removido com sucesso!" });
  } catch (error) {
    console.error("Erro deletarCliente:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

module.exports = {
  getResumoClientes,
  listarClientes,
  criarCliente,
  atualizarCliente,
  deletarCliente
};
