const db = require('../config/db_connection');
const { createLog } = require("./logController");
const { normalizeString } = require("../utils/formatStrg");

async function listarTipoClientes(req, res) {
    try {
        const [rows] = await db.execute('SELECT id, nome FROM tipo_clientes ORDER BY id ASC');

        return res.json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro no servidor.' });
    }
};

async function criarTipoCliente(req, res) {
    try {
        const { nome } = req.body;
        
        if (!nome || nome.trim() === '') return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });

        const [result] = await db.execute('INSERT INTO tipo_clientes (nome) VALUES (?)', [normalizeString(nome)]);

        await createLog({
            usuario_id: req.usuario.id,
            acao: "Criado um novo tipo de cliente",
            entidade: "tipo_cliente",
            entidade_id: result.insertId,
            descricao: `Adicionado novo tipo de cliente: ${nome}`
        });

        return res.status(201).json({ id: result.insertId, nome: nome.trim() });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro no servidor.' });
    }
};

async function atualizarTipoCliente(req, res) {
    try {
        const { id } = req.params;
        const { nome } = req.body;

        if (!id) return res.status(400).json({ error: 'ID é obrigatório.' });

        if (!nome || nome.trim() === '') return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });

        const [result] = await db.execute('UPDATE tipo_clientes SET nome = ? WHERE id = ?', [nome.trim(), id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tipo de cliente não encontrado.' });
        }

        await createLog({
            usuario_id: req.usuario.id,
            acao: "Atualizado um tipo de cliente",
            entidade: "tipo_cliente",
            entidade_id: id,
            descricao: `Atualizado o tipo de cliente: ${nome}`
        });


        return res.json({ message: 'Tipo de cliente atualizado com sucesso.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro no servidor.' });
    }
};

async function deletarTipoCliente(req, res) {
    try {
        const { id } = req.params;

        if (!id) return res.status(400).json({ error: 'ID é obrigatório.' });

        const [result] = await db.execute('DELETE FROM tipo_clientes WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tipo de cliente não encontrado.' });
        }

        await createLog({
            usuario_id: req.usuario.id,
            acao: "Removido um tipo de cliente",
            entidade: "tipo_cliente",
            entidade_id: id,
            descricao: `Removido um tipo de cliente: ${id}`
        });

        return res.json({ message: 'Tipo de cliente deletado com sucesso.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro no servidor.' });
    }
};

module.exports = {
    listarTipoClientes,
    criarTipoCliente,
    atualizarTipoCliente,
    deletarTipoCliente
}
