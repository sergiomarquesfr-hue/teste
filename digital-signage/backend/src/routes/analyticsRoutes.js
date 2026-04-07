const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const analyticsController = require('../controllers/analyticsController');
const { auth, admin } = require('../middleware/auth');

// Rotas de analytics
router.get('/dashboard', auth, analyticsController.getDashboardAnalytics);
router.get('/screens/:screenId', auth, analyticsController.getScreenAnalytics);
router.get('/content/:contentId', auth, analyticsController.getContentAnalytics);
router.get('/playlists/:playlistId', auth, analyticsController.getPlaylistAnalytics);

// Exportar relatório
router.post('/export', auth, admin, analyticsController.exportReport);

// Eventos em tempo real (para dispositivos)
router.post('/event', analyticsController.logEvent);

module.exports = router;
