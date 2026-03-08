const db = require('../config/db_connection');
const { createLog } = require("./logController");
const { onlyNumbers } = require("../utils/normalizeString");

async function getResumoImoveis(req, res) {
  try {
    const [[totais]] = await db.execute(`SELECT COUNT(*) AS total FROM imoveis
    `);

    res.json({
      total: totais.total || 0
    });
  } catch (err) {
    console.error("Erro ao buscar resumo de imoveis:", err);
    res.status(500).json({ error: "Erro ao buscar resumo" });
  }
};


async function listarImoveis(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { q, status, tipo_imovel } = req.query;

    let where = "WHERE 1=1";
    const params = [];

    if (q) {
      where += " AND (logradouro LIKE ? OR bairro LIKE ?)";
      params.push(`%${q}%`, `%${q}%`);
    }

    if (status) {
      where += " AND status = ?";
      params.push(status);
    }

    if (tipo_imovel) {
      where += " AND tipo_imovel = ?";
      params.push(tipo_imovel);
    }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM imoveis ${where}`,
      params
    );

    const [rows] = await db.query(`SELECT * FROM imoveis ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
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

  } catch (err) {
    console.error("Erro listarImoveis:", err);
    return res.status(500).json({ error: err.message || "Erro no servidor ao listar imóveis." });
  }
}

async function getImoveisDisponiveisById(req, res) {
    try {
        const { clienteId } = req.params;

        const [rows] = await db.execute('SELECT * FROM imoveis WHERE cliente_id = ? AND status = ? ORDER BY id ASC', [clienteId, 'Disponivel']);

        return res.json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || 'Erro no servidor, ao listar imoveis' });
    }
};

async function criarImovel(req, res) {
    try {
        const { cliente_id, tipo_imovel, cep, logradouro, numero, complemento, bairro, cidade, estado, area_m2, status } = req.body;

        const [[cliente]] = await db.query(`
            SELECT
                tc.nome AS tipo_cliente_nome
            FROM clientes c
            JOIN tipo_clientes tc ON tc.id = c.tipo_cliente_id
            WHERE c.id = ?`, [cliente_id]
        );

        if (!cliente) throw new Error("Cliente não encontrado");
        if (cliente.tipo_cliente_nome !== 'locador' && cliente.tipo_cliente_nome !== 'ambos') throw new Error("Cliente não é locador");
        if (!cliente_id || !tipo_imovel || !cep || !logradouro || !numero || !estado) throw new Error("Campos obrigatórios devem ser preenchido.");

        const [result] = await db.execute('INSERT INTO imoveis (cliente_id, tipo_imovel, cep, logradouro, numero, complemento, bairro, cidade, estado, area_m2, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [cliente_id, tipo_imovel, onlyNumbers(cep), logradouro, numero, complemento, bairro, cidade, estado, area_m2, status]
        );

        await createLog({
            usuario_id: req.usuario.id,
            acao: "Criado um novo imovel",
            entidade: "imovel",
            entidade_id: result.insertId,
            descricao: `Adicionado novo imovel: ${result.insertId}`
        });

        return res.status(201).json({ id: result.insertId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || 'Erro no servidor, ao criar imovel' });
    }
};

async function atualizarImovel(req, res) {
    try {
        const { id } = req.params;
        const { cliente_id, tipo_imovel, cep, logradouro, numero, complemento, bairro, cidade, estado, area_m2, status } = req.body;

        if (!id) throw new Error("ID é obrigatório.");

        const [[cliente]] = await db.query(`
            SELECT
                tc.nome AS tipo_cliente_nome
            FROM clientes c
            JOIN tipo_clientes tc ON tc.id = c.tipo_cliente_id
            WHERE c.id = ?`, [cliente_id]
        );

        if (!cliente) throw new Error("Cliente não encontrado");
        if (cliente.tipo_cliente_nome !== 'locador' && cliente.tipo_cliente_nome !== 'ambos') throw new Error("Cliente não é locador");
        
        if (!cliente_id || !tipo_imovel || !cep || !logradouro || !numero || !estado) throw new Error("Campos obrigatórios devem ser preenchido.");

        const [result] = await db.execute('UPDATE imoveis SET cliente_id = ?, tipo_imovel = ?, cep = ?, logradouro = ?, numero = ?, complemento = ?, bairro = ?, cidade = ?, estado = ?, area_m2 = ?, status = ? WHERE id = ?',
            [cliente_id, tipo_imovel, onlyNumbers(cep), logradouro, numero, complemento, bairro, cidade, estado, area_m2, status, id]
        );

        if (result.affectedRows === 0) throw new Error("Imovel não encontrado.");

        await createLog({
            usuario_id: req.usuario.id,
            acao: "Atualizado um imovel",
            entidade: "imovel",
            entidade_id: id,
            descricao: `Atualizado o imovel: ${id}`
        });


        return res.json({ message: 'imovel atualizado com sucesso.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || 'Erro no servidor, ao atualizar imovel' });
    }
};

async function deletarImovel(req, res) {
    try {
        const { id } = req.params;

        if (!id) throw new Error("ID é obrigatório.");

        const [result] = await db.execute('DELETE FROM imoveis WHERE id = ?', [id]);

        if (result.affectedRows === 0) throw new Error("Imovel não encontrado.");

        await createLog({
            usuario_id: req.usuario.id,
            acao: "Removido um imovel",
            entidade: "imovel",
            entidade_id: id,
            descricao: `Removido um imovel: ${id}`
        });

        return res.json({ message: 'imovel deletado com sucesso.' });
    } catch (err) {
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(400).json({error: "Não é possível excluir este imóvel pois existem arquivos vinculados."});
        } else {
            return res.status(500).json({ error: 'Erro no servidor, ao apagar imovel' });
        }
    }
};

module.exports = {
    getResumoImoveis,
    listarImoveis,
    getImoveisDisponiveisById,
    criarImovel,
    atualizarImovel,
    deletarImovel
}
