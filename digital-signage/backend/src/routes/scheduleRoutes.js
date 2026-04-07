const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const scheduleController = require('../controllers/scheduleController');
const { auth, admin } = require('../middleware/auth');

// Rotas de agendamento
router.post(
  '/',
  auth,
  [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('playlistId').notEmpty().withMessage('Playlist é obrigatória'),
    body('startDate').optional().isISO8601().withMessage('Data de início inválida'),
    body('endDate').optional().isISO8601().withMessage('Data de término inválida')
  ],
  scheduleController.createSchedule
);

router.get('/', auth, scheduleController.getSchedules);
router.get('/:id', auth, scheduleController.getScheduleById);

router.put(
  '/:id',
  auth,
  scheduleController.updateSchedule
);

router.delete('/:id', auth, scheduleController.deleteSchedule);

// Rotas adicionais
router.post('/:id/duplicate', auth, scheduleController.duplicateSchedule);
router.get('/screen/:screenId/active', scheduleController.getActiveScheduleForScreen);

// Aprovar/rejeitar agendamento (admin)
router.post('/:id/approve', auth, admin, scheduleController.approveSchedule || ((req, res) => res.json({message: 'Funcionalidade em desenvolvimento'})));
router.post('/:id/reject', auth, admin, scheduleController.rejectSchedule || ((req, res) => res.json({message: 'Funcionalidade em desenvolvimento'})));

module.exports = router;
