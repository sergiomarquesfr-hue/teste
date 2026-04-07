const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const screenGroupController = require('../controllers/screenGroupController');
const { auth, admin } = require('../middleware/auth');

// Rotas de grupos de telas
router.post(
  '/',
  auth,
  [
    body('name').notEmpty().withMessage('Nome é obrigatório')
  ],
  screenGroupController.createScreenGroup
);

router.get('/', auth, screenGroupController.getScreenGroups);
router.get('/:id', auth, screenGroupController.getScreenGroupById);

router.put(
  '/:id',
  auth,
  screenGroupController.updateScreenGroup
);

router.delete('/:id', auth, screenGroupController.deleteScreenGroup);

// Adicionar/remover telas do grupo
router.post('/:id/screens', auth, screenGroupController.addScreensToGroup);
router.delete('/:id/screens', auth, screenGroupController.removeScreensFromGroup);

// Estatísticas do grupo
router.get('/:id/stats', auth, screenGroupController.getGroupStats);

// Buscar por localização
router.get('/location/search', auth, screenGroupController.getGroupsByLocation);

module.exports = router;
