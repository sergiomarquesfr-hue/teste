const express = require('express');
const router = express.Router();
const Screen = require('../models/Screen');
const authMiddleware = require('../middleware/auth');

// Registrar novo dispositivo/player
router.post('/register', async (req, res) => {
  try {
    const { deviceId, name, platform, resolution, osVersion, appVersion } = req.body;

    if (!deviceId) {
      return res.status(400).json({ message: 'Device ID é obrigatório' });
    }

    // Verificar se dispositivo já existe
    let screen = await Screen.findOne({ deviceId });

    if (screen) {
      // Atualizar dispositivo existente
      screen.lastSeen = new Date();
      screen.status = 'online';
      if (name) screen.name = name;
      if (platform) screen.platform = platform;
      if (resolution) screen.resolution = resolution;
      if (osVersion) screen.osVersion = osVersion;
      if (appVersion) screen.appVersion = appVersion;
      
      await screen.save();
      
      res.json({ 
        message: 'Dispositivo atualizado com sucesso',
        screen,
        token: screen.authToken
      });
    } else {
      // Criar novo dispositivo
      const authToken = 'screen_' + Math.random().toString(36).substr(2, 16);
      
      screen = new Screen({
        deviceId,
        name: name || `Player-${deviceId.substring(0, 8)}`,
        platform: platform || 'unknown',
        resolution: resolution || '1920x1080',
        osVersion,
        appVersion,
        status: 'online',
        authToken,
        lastSeen: new Date()
      });

      await screen.save();

      res.status(201).json({ 
        message: 'Dispositivo registrado com sucesso',
        screen,
        token: authToken
      });
    }
  } catch (error) {
    console.error('Erro ao registrar dispositivo:', error);
    res.status(500).json({ message: 'Erro ao registrar dispositivo', error: error.message });
  }
});

// Autenticar dispositivo
router.post('/authenticate', async (req, res) => {
  try {
    const { deviceId, authToken } = req.body;

    if (!deviceId || !authToken) {
      return res.status(400).json({ message: 'Device ID e Auth Token são obrigatórios' });
    }

    const screen = await Screen.findOne({ deviceId, authToken });

    if (!screen) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    screen.lastSeen = new Date();
    screen.status = 'online';
    await screen.save();

    res.json({
      message: 'Autenticação bem-sucedida',
      screen,
      token: authToken
    });
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ message: 'Erro na autenticação', error: error.message });
  }
});

// Atualizar status do dispositivo (heartbeat)
router.post('/:deviceId/heartbeat', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { status, currentContent, cpuUsage, memoryUsage, storageFree, temperature } = req.body;

    const screen = await Screen.findOne({ deviceId });

    if (!screen) {
      return res.status(404).json({ message: 'Dispositivo não encontrado' });
    }

    screen.lastSeen = new Date();
    if (status) screen.status = status;
    if (currentContent) screen.currentContent = currentContent;
    
    // Métricas de saúde
    if (cpuUsage !== undefined) screen.metrics = { ...screen.metrics, cpuUsage };
    if (memoryUsage !== undefined) screen.metrics = { ...screen.metrics, memoryUsage };
    if (storageFree !== undefined) screen.metrics = { ...screen.metrics, storageFree };
    if (temperature !== undefined) screen.metrics = { ...screen.metrics, temperature };

    await screen.save();

    res.json({ message: 'Heartbeat recebido', screen });
  } catch (error) {
    console.error('Erro ao receber heartbeat:', error);
    res.status(500).json({ message: 'Erro ao receber heartbeat', error: error.message });
  }
});

// Reportar erro do dispositivo
router.post('/:deviceId/error', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { errorType, errorMessage, stackTrace, contentId, timestamp } = req.body;

    const screen = await Screen.findOne({ deviceId });

    if (!screen) {
      return res.status(404).json({ message: 'Dispositivo não encontrado' });
    }

    // Salvar log de erro
    const errorLog = {
      type: errorType,
      message: errorMessage,
      stackTrace,
      contentId,
      timestamp: timestamp || new Date()
    };

    screen.errorLogs = screen.errorLogs || [];
    screen.errorLogs.push(errorLog);
    
    // Manter apenas últimos 100 erros
    if (screen.errorLogs.length > 100) {
      screen.errorLogs = screen.errorLogs.slice(-100);
    }

    screen.status = 'warning';
    await screen.save();

    res.json({ message: 'Erro reportado com sucesso' });
  } catch (error) {
    console.error('Erro ao reportar erro:', error);
    res.status(500).json({ message: 'Erro ao reportar erro', error: error.message });
  }
});

// Obter configuração do dispositivo
router.get('/:deviceId/config', async (req, res) => {
  try {
    const { deviceId } = req.params;

    const screen = await Screen.findById(deviceId)
      .populate('currentPlaylist');

    if (!screen) {
      return res.status(404).json({ message: 'Dispositivo não encontrado' });
    }

    const config = {
      screenId: screen._id,
      name: screen.name,
      orientation: screen.orientation,
      layout: screen.layout,
      settings: screen.settings,
      currentPlaylist: screen.currentPlaylist,
      serverTime: new Date()
    };

    res.json(config);
  } catch (error) {
    console.error('Erro ao obter configuração:', error);
    res.status(500).json({ message: 'Erro ao obter configuração', error: error.message });
  }
});

// Validar código de ativação
router.post('/activate', async (req, res) => {
  try {
    const { activationCode } = req.body;

    if (!activationCode) {
      return res.status(400).json({ message: 'Código de ativação é obrigatório' });
    }

    // Em um sistema real, você teria uma coleção de códigos de ativação
    // Aqui estamos usando uma implementação simplificada
    const validPrefix = 'ACTIVATE-';
    
    if (!activationCode.startsWith(validPrefix)) {
      return res.status(400).json({ message: 'Código de ativação inválido' });
    }

    // Gerar deviceId e token
    const deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
    const authToken = 'screen_' + Math.random().toString(36).substr(2, 16);

    res.json({
      message: 'Ativação bem-sucedida',
      deviceId,
      token: authToken
    });
  } catch (error) {
    console.error('Erro na ativação:', error);
    res.status(500).json({ message: 'Erro na ativação', error: error.message });
  }
});

module.exports = router;
