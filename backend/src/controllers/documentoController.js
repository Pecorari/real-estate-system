const connection = require('../config/db_connection');
const path = require('path');
const fs = require('fs');
const { createLog } = require("./logController");

const uploadDocumento = async (req, res) => {
    try {
        const arquivoId = req.params.id;
        const { tipo_documento_id } = req.body;

        if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado." });

        const nomeArquivoSalvo = req.file.filename;
        const nomeOriginal = req.file.originalname;
        const caminho = path.relative(path.join(__dirname, ".."), req.file.path);

        if (!tipo_documento_id) return res.status(400).json({ error: "tipo_documento_id é obrigatório." });

        const [result] = await connection.execute(`INSERT INTO documentos (arquivo_id, tipo_documento_id, nome_original, nome, caminho) VALUES (?, ?, ?, ?, ?)`,
            [arquivoId, tipo_documento_id, nomeOriginal, nomeArquivoSalvo, caminho]
        );

        await createLog({
            usuario_id: req.usuario.id,
            acao: "Adicionado um documento",
            entidade: "documento",
            entidade_id: result.insertId,
            descricao: `Adicionado um novo documento ${result.insertId}`
        });

        return res.status(201).json({ message: "Documento enviado com sucesso!",
            documento_id: result.insertId,
            arquivo: nomeOriginal
        });
    } catch (error) {
        console.error("Erro ao fazer upload do documento:", error);
        return res.status(500).json({ error: "Erro ao fazer upload do documento" });
    }
}

const listarDocumentos = async (req, res) => {
    try {
        const arquivoId = req.params.id;

        const [docs] = await connection.execute(`SELECT * FROM documentos WHERE arquivo_id = ? ORDER BY created_at DESC`, [arquivoId]);

        return res.status(200).json(docs);
    } catch (error) {
        console.error("Erro ao listar documentos:", error);
        return res.status(500).json({ error: "Erro ao listar documentos" });
    }
}

const downloadDocumento = async (req, res) => {
    try {
        const arquivoId = req.params.id;
        const docId = req.params.docId;
        const [[doc]] = await connection.execute(`SELECT * FROM documentos WHERE id = ? AND arquivo_id = ?`, [docId, arquivoId]);
        
        if (!doc) return res.status(404).json({ error: "Documento não encontrado." });
        
        const filePath = path.join(__dirname, "..", doc.caminho);
        
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Arquivo físico não encontrado no servidor." });
        
        const nomeSanitizado = doc.nome_original?.replace(/[^\w.\-() ]+/g, "") || "arquivo.pdf";

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${nomeSanitizado}"`,
            "X-File-Name": nomeSanitizado,
        });

        await createLog({
            usuario_id: req.usuario.id,
            acao: "Feito download de um documento",
            entidade: "documento",
            entidade_id: docId,
            descricao: `Download de um documento: ${docId}`
        });
        
        return res.download(filePath, nomeSanitizado, (err) => {
            if (err) {
                console.error("Erro ao enviar arquivo:", err);
                return res.status(500).json({ error: "Erro ao enviar arquivo" });
            }
        });
    } catch (error) {
        console.error("Erro ao fazer download do documento:", error);
        return res.status(500).json({ error: "Erro ao fazer download do documento" });
    }
}

const deletarDocumento = async (req, res) => {
    try {
        const arquivoId = req.params.id;
        const docId = req.params.docId;

        if (!docId) return res.status(400).json({ error: "docId é obrigatório." });

        const [[doc]] = await connection.execute(`SELECT * FROM documentos WHERE id = ? AND arquivo_id = ?`, [docId, arquivoId]);

        if (!doc) return res.status(404).json({ error: "Documento não encontrado." });

        const filePath = path.join(__dirname, "..", doc.caminho);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        } else {
            console.warn("Arquivo não existe fisicamente:", filePath);
        }

        await connection.execute(`DELETE FROM documentos WHERE id = ?`, [docId]);

        await createLog({
            usuario_id: req.usuario.id,
            acao: "Removido um documento",
            entidade: "documento",
            entidade_id: docId,
            descricao: `Deletado um documento ${docId}`
        });

        return res.status(200).json({ message: "Documento excluído com sucesso." });
    } catch (error) {
        console.error("Erro ao deletar documento:", error);
        return res.status(500).json({ error: "Erro ao deletar documento" });
    }
};

module.exports = {
    uploadDocumento,
    listarDocumentos,
    downloadDocumento,
    deletarDocumento
}
