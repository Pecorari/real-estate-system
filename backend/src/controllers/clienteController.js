const db = require("../config/db_connection");
const { createLog } = require("./logController");

function onlyNumbers(value) {
  return value.replace(/\D/g, "");
}
function formatCpfCnpj(value) {
  if (!value) return "";
  if (value.length === 11) return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (value.length === 14) return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return value;
}

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { q, tipo } = req.query;

    let where = "WHERE 1=1";
    const params = [];

    if (q) {
      const qLimpo = onlyNumbers(q);
      const temLetra = /[a-zA-Z]/.test(q);

      if (temLetra) {
        where += " AND nome LIKE ?";
        params.push(`%${q}%`);
      } else {
        where += " AND (id LIKE ? OR cpf_cnpj LIKE ?)";
        params.push(`%${qLimpo}%`, `%${qLimpo}%`);
      }
    }

    if (tipo) {
      where += " AND tipo = ?";
      params.push(tipo);
    }

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM clientes ${where}`,
      params
    );

    const [rows] = await db.query(`SELECT id, nome, cpf_cnpj, tipo, observacoes FROM clientes ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const clientesFormatados = rows.map(c => ({
      ...c,
      cpf_cnpj: formatCpfCnpj(c.cpf_cnpj)
    }));

    return res.json({
      data: clientesFormatados,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro listarClientes:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

async function criarCliente(req, res) {
  try {
    const { nome, cpf_cnpj, tipo, observacoes} = req.body;
    const cpf_cnpj_limpo = onlyNumbers(cpf_cnpj);

    if (!nome || !tipo)
      return res.status(400).json({ error: "Nome e tipo são obrigatórios." });

    if (!["locador", "locatario", "ambos"].includes(tipo.toLowerCase()))
      return res.status(400).json({ error: "Tipo deve ser 'locador', 'locatario' ou 'ambos'." });

    if (!cpf_cnpj_limpo)
        return res.status(400).json({ error: "CPF/CNPJ são obrigatórios." });

    const [result] = await db.query(`INSERT INTO clientes (nome, cpf_cnpj, tipo, observacoes) VALUES (?, ?, ?, ?)`,
      [nome, cpf_cnpj_limpo, tipo, observacoes || null]
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
        cpf_cnpj: formatCpfCnpj(cpf_cnpj_limpo),
        tipo,
        observacoes
      }
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Já existe um cliente cadastrado com este CPF/CNPJ" });
    }

    console.error("Erro criarCliente:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
}

async function atualizarCliente(req, res) {
  try {
    const { id } = req.params;
    const { nome, cpf_cnpj, tipo, observacoes } = req.body;
    const cpf_cnpj_limpo = cpf_cnpj ? onlyNumbers(cpf_cnpj) : null;

    if (!nome && !cpf_cnpj && !tipo && !observacoes) return res.status(400).json({ error: "Nenhum campo para atualizar." });

    const [existe] = await db.query(`SELECT id FROM clientes WHERE id = ?`, [id]);

    if (existe.length === 0)
      return res.status(400).json({ error: "Cliente não encontrado." });

    await db.query(`UPDATE clientes SET nome = ?, tipo = ?, cpf_cnpj = ?, observacoes = ? WHERE id = ?`,
      [
        nome,
        tipo,
        cpf_cnpj_limpo,
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
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "Já existe um cliente cadastrado com este CPF/CNPJ"
      });
    }

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
  
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        error: "Este cliente está vinculado a um ou mais arquivos e não pode ser removido."
      });
    }
    
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
