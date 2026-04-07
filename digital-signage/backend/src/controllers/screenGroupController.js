const ScreenGroup = require('../models/ScreenGroup');
const Screen = require('../models/Screen');

// Criar grupo de telas
exports.createScreenGroup = async (req, res) => {
  try {
    const { name, description, screenIds, tags, location } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nome é obrigatório' });
    }

    // Validar telas se fornecidas
    let screens = [];
    if (screenIds && screenIds.length > 0) {
      screens = await Screen.find({ _id: { $in: screenIds } });
      if (screens.length !== screenIds.length) {
        return res.status(404).json({ message: 'Uma ou mais telas não encontradas' });
      }
    }

    const screenGroup = new ScreenGroup({
      name,
      description,
      screens: screenIds || [],
      tags: tags || [],
      location,
      createdBy: req.user.id
    });

    await screenGroup.save();
    
    // Popular resposta com dados completos
    const populatedGroup = await ScreenGroup.findById(screenGroup._id)
      .populate('screens', 'name status lastSeen');

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error('Erro ao criar grupo de telas:', error);
    res.status(500).json({ message: 'Erro ao criar grupo de telas', error: error.message });
  }
};

// Obter todos os grupos
exports.getScreenGroups = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, tag } = req.query;
    
    let query = { createdBy: req.user.id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    const groups = await ScreenGroup.find(query)
      .populate('screens', 'name status lastSeen orientation')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await ScreenGroup.countDocuments(query);

    res.json({
      groups,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Erro ao buscar grupos de telas:', error);
    res.status(500).json({ message: 'Erro ao buscar grupos de telas', error: error.message });
  }
};

// Obter grupo por ID
exports.getScreenGroupById = async (req, res) => {
  try {
    const group = await ScreenGroup.findById(req.params.id)
      .populate('screens', 'name status lastSeen orientation resolution')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }

    if (group.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.json(group);
  } catch (error) {
    console.error('Erro ao buscar grupo:', error);
    res.status(500).json({ message: 'Erro ao buscar grupo', error: error.message });
  }
};

// Atualizar grupo
exports.updateScreenGroup = async (req, res) => {
  try {
    const group = await ScreenGroup.findOne({ 
      _id: req.params.id, 
      createdBy: req.user.id 
    });

    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }

    const { name, description, screenIds, tags, location } = req.body;

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    
    if (screenIds !== undefined) {
      // Validar novas telas
      if (screenIds.length > 0) {
        const screens = await Screen.find({ _id: { $in: screenIds } });
        if (screens.length !== screenIds.length) {
          return res.status(404).json({ message: 'Uma ou mais telas não encontradas' });
        }
      }
      group.screens = screenIds;
    }
    
    if (tags !== undefined) group.tags = tags;
    if (location !== undefined) group.location = location;

    await group.save();

    const updatedGroup = await ScreenGroup.findById(group._id)
      .populate('screens', 'name status lastSeen');

    res.json(updatedGroup);
  } catch (error) {
    console.error('Erro ao atualizar grupo:', error);
    res.status(500).json({ message: 'Erro ao atualizar grupo', error: error.message });
  }
};

// Excluir grupo
exports.deleteScreenGroup = async (req, res) => {
  try {
    const group = await ScreenGroup.findOneAndDelete({ 
      _id: req.params.id, 
      createdBy: req.user.id 
    });

    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }

    res.json({ message: 'Grupo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir grupo:', error);
    res.status(500).json({ message: 'Erro ao excluir grupo', error: error.message });
  }
};

// Adicionar tela(s) ao grupo
exports.addScreensToGroup = async (req, res) => {
  try {
    const group = await ScreenGroup.findOne({ 
      _id: req.params.id, 
      createdBy: req.user.id 
    });

    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }

    const { screenIds } = req.body;

    if (!screenIds || !Array.isArray(screenIds) || screenIds.length === 0) {
      return res.status(400).json({ message: 'IDs de telas são obrigatórios' });
    }

    // Validar telas
    const screens = await Screen.find({ _id: { $in: screenIds } });
    if (screens.length !== screenIds.length) {
      return res.status(404).json({ message: 'Uma ou mais telas não encontradas' });
    }

    // Adicionar apenas telas que ainda não estão no grupo
    const newScreenIds = screenIds.filter(id => 
      !group.screens.some(existingId => existingId.toString() === id)
    );

    if (newScreenIds.length === 0) {
      return res.json({ message: 'Todas as telas já estão no grupo', group });
    }

    group.screens.push(...newScreenIds);
    await group.save();

    const updatedGroup = await ScreenGroup.findById(group._id)
      .populate('screens', 'name status lastSeen');

    res.json(updatedGroup);
  } catch (error) {
    console.error('Erro ao adicionar telas ao grupo:', error);
    res.status(500).json({ message: 'Erro ao adicionar telas ao grupo', error: error.message });
  }
};

// Remover tela(s) do grupo
exports.removeScreensFromGroup = async (req, res) => {
  try {
    const group = await ScreenGroup.findOne({ 
      _id: req.params.id, 
      createdBy: req.user.id 
    });

    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }

    const { screenIds } = req.body;

    if (!screenIds || !Array.isArray(screenIds) || screenIds.length === 0) {
      return res.status(400).json({ message: 'IDs de telas são obrigatórios' });
    }

    group.screens = group.screens.filter(id => 
      !screenIds.some(removeId => removeId === id.toString())
    );

    await group.save();

    const updatedGroup = await ScreenGroup.findById(group._id)
      .populate('screens', 'name status lastSeen');

    res.json(updatedGroup);
  } catch (error) {
    console.error('Erro ao remover telas do grupo:', error);
    res.status(500).json({ message: 'Erro ao remover telas do grupo', error: error.message });
  }
};

// Obter estatísticas do grupo
exports.getGroupStats = async (req, res) => {
  try {
    const group = await ScreenGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }

    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const screens = await Screen.find({ _id: { $in: group.screens } });

    const stats = {
      totalScreens: screens.length,
      onlineScreens: screens.filter(s => s.status === 'online').length,
      offlineScreens: screens.filter(s => s.status === 'offline').length,
      warningScreens: screens.filter(s => s.status === 'warning').length,
      orientations: {
        landscape: screens.filter(s => s.orientation === 'landscape').length,
        portrait: screens.filter(s => s.orientation === 'portrait').length
      },
      resolutions: screens.map(s => s.resolution).reduce((acc, res) => {
        acc[res] = (acc[res] || 0) + 1;
        return acc;
      }, {})
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas do grupo:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas do grupo', error: error.message });
  }
};

// Buscar grupos por localização
exports.getGroupsByLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10000 } = req.query; // radius em metros

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude e longitude são obrigatórias' });
    }

    // Nota: Para busca geoespacial real, você precisaria configurar um índice 2dsphere no MongoDB
    // Esta é uma implementação simplificada
    const groups = await ScreenGroup.find({
      createdBy: req.user.id,
      'location.coordinates': { $exists: true }
    }).populate('screens', 'name status');

    // Filtrar por distância (implementação simplificada)
    const filteredGroups = groups.filter(group => {
      if (!group.location || !group.location.coordinates) return false;
      
      const [groupLon, groupLat] = group.location.coordinates;
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);
      
      // Cálculo simplificado de distância (Haversine formula seria mais preciso)
      const distance = Math.sqrt(
        Math.pow((userLat - groupLat) * 111, 2) +
        Math.pow((userLon - groupLon) * 111 * Math.cos(userLat * Math.PI / 180), 2)
      );
      
      return distance <= (radius / 1000); // converter para km
    });

    res.json(filteredGroups);
  } catch (error) {
    console.error('Erro ao buscar grupos por localização:', error);
    res.status(500).json({ message: 'Erro ao buscar grupos por localização', error: error.message });
  }
};
