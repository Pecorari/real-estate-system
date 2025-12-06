const express = require('express');
const upload = require('./config/multer');

const authController = require('./controllers/authController');
const usuarioController = require('./controllers/usuarioController');
const clienteController = require('./controllers/clienteController');
const arquivoController = require('./controllers/arquivoController');
const documentoController = require('./controllers/documentoController');
const searchController = require('./controllers/searchController');
const logController = require('./controllers/logController');

const { isAuth, isAdmin } = require('./middlewares/authMiddleware');

const router = express.Router();

// Autenticaçao
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', isAuth, authController.me);

// Usuarios (admin only)
router.get('/usuarios', isAuth, isAdmin, usuarioController.listarUsuarios);
router.post('/usuarios', usuarioController.criarUsuario);
router.put('/usuarios/:id', isAuth, isAdmin, usuarioController.atualizarUsuario);
router.delete('/usuarios/:id', isAuth, isAdmin, usuarioController.deletarUsuario);

// Clientes
router.get('/clientes', isAuth, clienteController.listarClientes);
router.post('/clientes', isAuth, clienteController.criarCliente);
router.put('/clientes/:id', isAuth, clienteController.atualizarCliente);
router.delete('/clientes/:id', isAuth, clienteController.deletarCliente);

// Arquivos
router.get('/arquivos', isAuth, arquivoController.listarArquivos);
router.post('/arquivos', isAuth, arquivoController.criarArquivo);
router.put('/arquivos/:id', isAuth, arquivoController.atualizarArquivo);
router.delete('/arquivos/:id', isAuth, arquivoController.deletarArquivo);

// Documentos
router.post('/arquivos/:id/documentos', upload.single('documento'), isAuth, documentoController.uploadDocumento);
router.get('/arquivos/:id/documentos', isAuth, documentoController.listarDocumentos);
router.get('/arquivos/:id/documentos/:docId/download', isAuth, documentoController.downloadDocumento);
router.delete('/arquivos/:id/documentos/:docId/delete', isAuth, documentoController.deletarDocumento);

// Pesquisa avançada
router.get('/search/clientes', isAuth, searchController.searchClientes);
router.get('/search/arquivos', isAuth, searchController.searchArquivos);

// Logs
router.get('/logs', logController.logController);

module.exports = router;
