const connection = require("../config/db_connection");

const listarLogs = async (req, res) => {
  try {
    const {
      usuario_id,
      acao,
      entidade,
      entidade_id,
      data_ini,
      data_fim,
      page = 1,
      limit = 15
    } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Number(limit) || 15);
    const offset = (pageNum - 1) * limitNum;

    let where = `WHERE 1 = 1`;
    const params = [];

    if (usuario_id) {
      where += ` AND l.usuario_id = ?`;
      params.push(usuario_id);
    }

    if (acao) {
      where += ` AND l.acao LIKE ?`;
      params.push(`%${acao}%`);
    }

    if (entidade) {
      where += ` AND l.entidade = ?`;
      params.push(entidade);
    }

    if (entidade_id) {
      where += ` AND l.entidade_id = ?`;
      params.push(entidade_id);
    }

    if (data_ini) {
      where += ` AND l.created_at >= ?`;
      params.push(`${data_ini} 00:00:00`);
    }

    if (data_fim) {
      where += ` AND l.created_at <= ?`;
      params.push(`${data_fim} 23:59:59`);
    }

    const [[{ total }]] = await connection.execute(`SELECT COUNT(*) AS total FROM logs l ${where}`, params);

    const [rows] = await connection.execute(`
      SELECT 
        l.*,
        u.nome AS usuario_nome
      FROM logs l
      LEFT JOIN usuarios u ON u.id = l.usuario_id
      ${where}
      ORDER BY l.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}`, params
    );

    res.json({
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      }
    });
  } catch (err) {
    console.error("Erro ao buscar logs:", err);
    res.status(500).json({ error: "Erro ao buscar logs" });
  }
};

async function createLog({ usuario_id, acao, entidade, entidade_id, descricao }) {
  try {
    await connection.execute(`INSERT INTO logs (usuario_id, acao, entidade, entidade_id, descricao) VALUES (?, ?, ?, ?, ?)`,
      [usuario_id, acao, entidade, entidade_id, descricao || null]
    );
  } catch (err) {
    console.error("Erro ao registrar log:", err);
  }
}

module.exports = {
    listarLogs,
    createLog
};
