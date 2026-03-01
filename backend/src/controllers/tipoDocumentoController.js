const db = require('../config/db_connection');
const { createLog } = require("./logController");
const { normalizeString } = require("../utils/normalizeString");

async function listarTipoDocumentos(req, res) {
    try {
        const [rows] = await db.execute('SELECT id, nome FROM tipo_documentos ORDER BY nome ASC');

        return res.json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || 'Erro no servidor.' });
    }
};

async function criarTipoDocumento(req, res) {
    try {
        const { nome } = req.body;

        if (!nome || nome.trim() === '') throw new Error(`O campo "nome" é obrigatório.`);

        const [result] = await db.execute('INSERT INTO tipo_documentos (nome) VALUES (?)', [normalizeString(nome)]);

        await createLog({
            usuario_id: req.usuario.id,
            acao: "Criado um novo tipo de documento",
            entidade: "tipo_documento",
            entidade_id: result.insertId,
            descricao: `Adicionado novo tipo de documento: ${nome}`
        });

        return res.status(201).json({ id: result.insertId, nome: normalizeString(nome) });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || 'Erro no servidor.' });
    }
};

async function atualizarTipoDocumento(req, res) {
    try {
        const { id } = req.params;
        const { nome } = req.body;

        if (!id) throw new Error("ID é obrigatório.");

        if (!nome || nome.trim() === '') throw new Error(`O campo "nome" é obrigatório.`);

        const [result] = await db.execute('UPDATE tipo_documentos SET nome = ? WHERE id = ?', [normalizeString(nome), id]);

        if (result.affectedRows === 0) throw new Error("Tipo de documento não encontrado.");

        await createLog({
            usuario_id: req.usuario.id,
            acao: "Atualizado um tipo de documento",
            entidade: "tipo_documento",
            entidade_id: id,
            descricao: `Atualizado o tipo de documento: ${nome}`
        });

        return res.json({ message: 'Tipo de documento atualizado com sucesso.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || 'Erro no servidor.' });
    }
};

async function deletarTipoDocumento(req, res) {
    try {
        const { id } = req.params;

        if (!id) throw new Error("ID é obrigatório.");

        const [result] = await db.execute('DELETE FROM tipo_documentos WHERE id = ?', [id]);

        if (result.affectedRows === 0) throw new Error("Tipo de documento não encontrado.");

        await createLog({
            usuario_id: req.usuario.id,
            acao: "Removido um tipo de documento",
            entidade: "tipo_documento",
            entidade_id: id,
            descricao: `Removido um tipo de documento: ${id}`
        });

        return res.json({ message: 'Tipo de documento deletado com sucesso.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || 'Erro no servidor.' });
    }
};

module.exports = {
    listarTipoDocumentos,
    criarTipoDocumento,
    atualizarTipoDocumento,
    deletarTipoDocumento
}
