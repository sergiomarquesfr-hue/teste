const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body } = require('express-validator');
const contentController = require('../controllers/contentController');
const { auth, admin } = require('../middleware/auth');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Rotas de conteúdo
router.post(
  '/',
  auth,
  upload.single('file'),
  [
    body('title').notEmpty().withMessage('Título é obrigatório'),
    body('type').isIn(['image', 'video', 'text', 'html', 'webpage']).withMessage('Tipo inválido')
  ],
  contentController.createContent
);

router.get('/', contentController.listContents);
router.get('/:id', contentController.getContentById);

router.put(
  '/:id',
  auth,
  [
    body('title').optional().notEmpty().withMessage('Título não pode ser vazio'),
    body('duration').optional().isInt({ min: 1 }).withMessage('Duração deve ser maior que 0')
  ],
  contentController.updateContent
);

router.delete('/:id', auth, contentController.deleteContent);

module.exports = router;
