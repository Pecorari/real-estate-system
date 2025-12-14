const db = require("../config/db_connection");
const { createLog } = require("./logController");

async function getResumoArquivos(req, res) {
  try {
    const [rows] = await db.execute(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) AS ativos,
        SUM(CASE WHEN status = 'encerrado' THEN 1 ELSE 0 END) AS encerrados,
        SUM(CASE WHEN status = 'inadimplente' THEN 1 ELSE 0 END) AS inadimplentes
      FROM arquivos
    `);

    res.json(rows[0]);
  } catch (error) {
    console.error("Erro ao buscar resumo:", error);
    res.status(500).json({ error: "Erro ao buscar resumo dos arquivos" });
  }
};

async function listarArquivos(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { q, status } = req.query;

    let where = "WHERE 1=1";
    const params = [];

    if (q) {
      where += `
        AND (
          locador.nome LIKE ?
          OR locatario.nome LIKE ?
          OR a.id LIKE ?
        )
      `;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (status) {
      where += " AND a.status = ?";
      params.push(status);
    }

    // total
    const [[{ total }]] = await db.query(
      `
      SELECT COUNT(*) as total
      FROM arquivos a
      LEFT JOIN clientes locador ON locador.id = a.cliente_locador_id
      LEFT JOIN clientes locatario ON locatario.id = a.cliente_locatario_id
      ${where}
      `,
      params
    );

    // dados
    const [rows] = await db.query(
      `
      SELECT 
        a.*,
        locador.nome AS locador_nome,
        locatario.nome AS locatario_nome
      FROM arquivos a
      LEFT JOIN clientes locador ON locador.id = a.cliente_locador_id
      LEFT JOIN clientes locatario ON locatario.id = a.cliente_locatario_id
      ${where}
      ORDER BY a.id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    return res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao listar arquivos:", error);
    return res.status(500).json({ error: "Erro ao listar arquivos." });
  }
}

async function detalharArquivo(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`SELECT a.*, locador.nome AS locador_nome, locatario.nome AS locatario_nome
      FROM arquivos a
      LEFT JOIN clientes locador ON locador.id = a.cliente_locador_id
      LEFT JOIN clientes locatario ON locatario.id = a.cliente_locatario_id
      WHERE a.id = ?`, [id]
    );

    if (!rows.length) return res.status(404).json({ error: "Arquivo não encontrado." });

    return res.json(rows[0]);
  } catch (error) {
    console.error("Erro ao buscar detalhe do arquivo:", error);
    return res.status(500).json({ error: "Erro ao buscar arquivo." });
  }
}

async function criarArquivo(req, res) {
  try {
    const { cliente_locador_id, cliente_locatario_id, data_inicio, data_fim, status, observacoes } = req.body;

    if (!cliente_locador_id || !cliente_locatario_id || !data_inicio) {
      return res.status(400).json({
        error: "Campos obrigatórios: cliente_locador_id, cliente_locatario_id, data_inicio."
      });
    }

    const [result] = await db.query(`INSERT INTO arquivos (cliente_locador_id, cliente_locatario_id, data_inicio, data_fim, status, observacoes) VALUES (?, ?, ?, ?, ?, ?)`,
      [cliente_locador_id, cliente_locatario_id, data_inicio, data_fim || null, status, observacoes || null]
    );

    await createLog({
      usuario_id: req.usuario.id,
      acao: "Criado um arquivo",
      entidade: "arquivo",
      entidade_id: result.insertId,
      descricao: `Arquivo ${result.insertId} criado`
    });

    return res.json({ message: "Arquivo criado com sucesso!", id: result.insertId });
  } catch (error) {
    console.error("Erro ao criar arquivo:", error);
    return res.status(500).json({ error: "Erro ao criar arquivo." });
  }
}

async function atualizarArquivo(req, res) {
  try {
    const { id } = req.params;

    const { cliente_locador_id, cliente_locatario_id, data_inicio, data_fim, status, observacoes } = req.body;

    const [existe] = await db.query("SELECT * FROM arquivos WHERE id = ?", [id]);
    if (existe.length === 0) return res.status(404).json({ error: "Arquivo não encontrado." });

    await db.query(`UPDATE arquivos SET cliente_locador_id=?, cliente_locatario_id=?, data_inicio=?, data_fim=?, status=?, observacoes=? WHERE id=?`,
      [cliente_locador_id, cliente_locatario_id, data_inicio, data_fim || null, status, observacoes || null, id]
    );

    await createLog({
      usuario_id: req.usuario.id,
      acao: "Atualizado um arquivo",
      entidade: "arquivo",
      entidade_id: id,
      descricao: `Arquivo ${id} atualizado`
    });

    return res.json({ message: "Arquivo atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar arquivo:", error);
    return res.status(500).json({ error: "Erro ao atualizar arquivo." });
  }
}

async function deletarArquivo(req, res) {
  try {
    const { id } = req.params;

    const [existe] = await db.query("SELECT * FROM arquivos WHERE id = ?", [id]);
    if (!existe.length) return res.status(404).json({ error: "Arquivo não encontrado." });

    await db.query("DELETE FROM arquivos WHERE id = ?", [id]);

    await createLog({
      usuario_id: req.usuario.id,
      acao: "Removido um arquivo",
      entidade: "arquivo",
      entidade_id: id,
      descricao: `Arquivo ${id} apagado`
    });

    return res.json({ message: "Arquivo deletado com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    return res.status(500).json({ error: "Erro ao deletar arquivo." });
  }
}

module.exports = {
  getResumoArquivos,
  listarArquivos,
  detalharArquivo,
  criarArquivo,
  atualizarArquivo,
  deletarArquivo
};
