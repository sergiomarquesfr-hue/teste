const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const playlistController = require('../controllers/playlistController');
const { auth, admin } = require('../middleware/auth');

// Rotas de playlists
router.post(
  '/',
  auth,
  [
    body('name').notEmpty().withMessage('Nome é obrigatório')
  ],
  playlistController.createPlaylist
);

router.get('/', playlistController.listPlaylists);
router.get('/:id', playlistController.getPlaylistById);

router.put(
  '/:id',
  auth,
  playlistController.updatePlaylist
);

router.delete('/:id', auth, playlistController.deletePlaylist);

module.exports = router;
