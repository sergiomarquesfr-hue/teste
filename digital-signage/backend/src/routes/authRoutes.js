const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth, admin } = require('../middleware/auth');

// Rotas de autenticação
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('E-mail inválido'),
    body('password').notEmpty().withMessage('Senha é obrigatória')
  ],
  authController.login
);

router.get('/profile', auth, authController.getProfile);
router.get('/users', auth, admin, authController.listUsers);

module.exports = router;
