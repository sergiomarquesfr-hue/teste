const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const templateController = require('../controllers/templateController');
const { auth, admin } = require('../middleware/auth');

// Rotas de templates
router.post(
  '/',
  auth,
  [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('layout').optional().isIn(['landscape', 'portrait', 'custom']).withMessage('Layout inválido')
  ],
  templateController.createTemplate
);

router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplateById);

router.put(
  '/:id',
  auth,
  templateController.updateTemplate
);

router.delete('/:id', auth, templateController.deleteTemplate);

// Duplicar template
router.post('/:id/duplicate', auth, templateController.duplicateTemplate);

// Templates por categoria
router.get('/category/:category', templateController.getTemplatesByCategory);

// Aplicar template a tela
router.post('/:id/apply', auth, templateController.applyTemplateToScreen);

// Preview do template
router.get('/:id/preview', templateController.getTemplatePreview);

// Templates públicos
router.get('/public/templates', templateController.listPublicTemplates || templateController.getTemplates);

module.exports = router;
