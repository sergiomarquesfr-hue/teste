const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const screenController = require('../controllers/screenController');
const { auth, admin } = require('../middleware/auth');

// Rotas de telas
router.post(
  '/',
  auth,
  [
    body('name').notEmpty().withMessage('Nome é obrigatório')
  ],
  screenController.createScreen
);

router.get('/', screenController.listScreens);
router.get('/:id', screenController.getScreenById);

router.put(
  '/:id',
  auth,
  screenController.updateScreen
);

router.delete('/:id', auth, admin, screenController.deleteScreen);

// Rota para heartbeat do dispositivo
router.post('/device/heartbeat', screenController.deviceHeartbeat);

module.exports = router;
