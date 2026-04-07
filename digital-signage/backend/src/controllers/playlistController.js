const Playlist = require('../models/Playlist');
const { validationResult } = require('express-validator');

// Criar playlist
exports.createPlaylist = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, items, loop, schedule } = req.body;

    const playlist = new Playlist({
      name,
      description,
      items,
      loop,
      schedule,
      createdBy: req.user._id
    });

    await playlist.save();
    res.status(201).json({ playlist });
  } catch (error) {
    console.error('Erro ao criar playlist:', error);
    res.status(500).json({ error: 'Erro ao criar playlist.' });
  }
};

// Listar playlists
exports.listPlaylists = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const playlists = await Playlist.find(filter)
      .populate('items.content', 'title type url duration')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Playlist.countDocuments(filter);

    res.json({
      playlists,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Erro ao listar playlists:', error);
    res.status(500).json({ error: 'Erro ao listar playlists.' });
  }
};

// Obter playlist por ID
exports.getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('items.content')
      .populate('createdBy', 'name email');
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist não encontrada.' });
    }

    res.json({ playlist });
  } catch (error) {
    console.error('Erro ao obter playlist:', error);
    res.status(500).json({ error: 'Erro ao obter playlist.' });
  }
};

// Atualizar playlist
exports.updatePlaylist = async (req, res) => {
  try {
    const { name, description, items, loop, schedule, isActive } = req.body;

    let playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist não encontrada.' });
    }

    // Verificar permissão
    if (playlist.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para editar esta playlist.' });
    }

    playlist.name = name || playlist.name;
    playlist.description = description || playlist.description;
    playlist.items = items || playlist.items;
    playlist.loop = loop !== undefined ? loop : playlist.loop;
    playlist.schedule = schedule || playlist.schedule;
    playlist.isActive = isActive !== undefined ? isActive : playlist.isActive;

    await playlist.save();
    res.json({ playlist });
  } catch (error) {
    console.error('Erro ao atualizar playlist:', error);
    res.status(500).json({ error: 'Erro ao atualizar playlist.' });
  }
};

// Deletar playlist
exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist não encontrada.' });
    }

    // Verificar permissão
    if (playlist.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para deletar esta playlist.' });
    }

    await Playlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Playlist deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar playlist:', error);
    res.status(500).json({ error: 'Erro ao deletar playlist.' });
  }
};
