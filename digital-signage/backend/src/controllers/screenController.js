const Screen = require('../models/Screen');
const Device = require('../models/Device');
const { validationResult } = require('express-validator');

// Criar tela
exports.createScreen = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, location, deviceId } = req.body;

    const screen = new Screen({
      name,
      location,
      deviceId
    });

    await screen.save();
    res.status(201).json({ screen });
  } catch (error) {
    console.error('Erro ao criar tela:', error);
    res.status(500).json({ error: 'Erro ao criar tela.' });
  }
};

// Listar telas
exports.listScreens = async (req, res) => {
  try {
    const { status, isActive, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const screens = await Screen.find(filter)
      .populate('playlists', 'name')
      .populate('currentContent', 'title type')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Screen.countDocuments(filter);

    res.json({
      screens,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Erro ao listar telas:', error);
    res.status(500).json({ error: 'Erro ao listar telas.' });
  }
};

// Obter tela por ID
exports.getScreenById = async (req, res) => {
  try {
    const screen = await Screen.findById(req.params.id)
      .populate('playlists')
      .populate('currentContent');
    
    if (!screen) {
      return res.status(404).json({ error: 'Tela não encontrada.' });
    }

    res.json({ screen });
  } catch (error) {
    console.error('Erro ao obter tela:', error);
    res.status(500).json({ error: 'Erro ao obter tela.' });
  }
};

// Atualizar tela
exports.updateScreen = async (req, res) => {
  try {
    const { name, location, playlists, currentContent, isActive } = req.body;

    let screen = await Screen.findById(req.params.id);
    
    if (!screen) {
      return res.status(404).json({ error: 'Tela não encontrada.' });
    }

    screen.name = name || screen.name;
    screen.location = location || screen.location;
    screen.playlists = playlists || screen.playlists;
    screen.currentContent = currentContent || screen.currentContent;
    screen.isActive = isActive !== undefined ? isActive : screen.isActive;

    await screen.save();
    res.json({ screen });
  } catch (error) {
    console.error('Erro ao atualizar tela:', error);
    res.status(500).json({ error: 'Erro ao atualizar tela.' });
  }
};

// Deletar tela
exports.deleteScreen = async (req, res) => {
  try {
    const screen = await Screen.findById(req.params.id);
    
    if (!screen) {
      return res.status(404).json({ error: 'Tela não encontrada.' });
    }

    await Screen.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tela deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar tela:', error);
    res.status(500).json({ error: 'Erro ao deletar tela.' });
  }
};

// Registrar heartbeat do dispositivo
exports.deviceHeartbeat = async (req, res) => {
  try {
    const { deviceId, platform, version, ipAddress, resolution, orientation } = req.body;

    // Atualizar ou criar dispositivo
    let device = await Device.findOne({ deviceId });

    if (!device) {
      device = new Device({
        deviceId,
        platform,
        version,
        ipAddress,
        resolution,
        orientation,
        isOnline: true,
        lastHeartbeat: new Date()
      });
    } else {
      device.isOnline = true;
      device.lastHeartbeat = new Date();
      device.ipAddress = ipAddress || device.ipAddress;
      device.version = version || device.version;
    }

    await device.save();

    // Atualizar status da tela associada
    if (device.screen) {
      await Screen.findByIdAndUpdate(device.screen, {
        status: 'online',
        lastSeen: new Date()
      });
    }

    // Obter playlists e conteúdo para o dispositivo
    const screen = await Screen.findOne({ deviceId }).populate('playlists');
    
    res.json({
      device,
      screen,
      playlists: screen?.playlists || []
    });
  } catch (error) {
    console.error('Erro no heartbeat:', error);
    res.status(500).json({ error: 'Erro no heartbeat.' });
  }
};
