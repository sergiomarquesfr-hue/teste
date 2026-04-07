const Template = require('../models/Template');
const Content = require('../models/Content');
const Screen = require('../models/Screen');

// Criar template
exports.createTemplate = async (req, res) => {
  try {
    const { name, description, layout, zones, thumbnail, category, tags } = req.body;

    // Validar zonas
    if (!zones || !Array.isArray(zones) || zones.length === 0) {
      return res.status(400).json({ message: 'Template deve ter pelo menos uma zona' });
    }

    // Validar cada zona
    for (const zone of zones) {
      if (!zone.type || !zone.position || !zone.size) {
        return res.status(400).json({ message: 'Cada zona deve ter type, position e size' });
      }
      
      if (zone.type === 'content' && zone.defaultContent) {
        const content = await Content.findById(zone.defaultContent);
        if (!content) {
          return res.status(404).json({ message: `Conteúdo padrão não encontrado: ${zone.defaultContent}` });
        }
      }
    }

    const template = new Template({
      name,
      description,
      layout: layout || 'landscape',
      zones,
      thumbnail,
      category,
      tags: tags || [],
      createdBy: req.user.id
    });

    await template.save();
    res.status(201).json(template);
  } catch (error) {
    console.error('Erro ao criar template:', error);
    res.status(500).json({ message: 'Erro ao criar template', error: error.message });
  }
};

// Obter todos os templates
exports.getTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    
    let query = {};
    
    // Apenas templates públicos ou do usuário
    if (req.user) {
      query.$or = [
        { isPublic: true },
        { createdBy: req.user.id }
      ];
    } else {
      query.isPublic = true;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const templates = await Template.find(query)
      .populate('createdBy', 'name email')
      .populate('zones.defaultContent', 'name type url')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Template.countDocuments(query);

    res.json({
      templates,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    res.status(500).json({ message: 'Erro ao buscar templates', error: error.message });
  }
};

// Obter template por ID
exports.getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('zones.defaultContent', 'name type url thumbnail duration');

    if (!template) {
      return res.status(404).json({ message: 'Template não encontrado' });
    }

    // Verificar permissões
    if (!template.isPublic && template.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.json(template);
  } catch (error) {
    console.error('Erro ao buscar template:', error);
    res.status(500).json({ message: 'Erro ao buscar template', error: error.message });
  }
};

// Atualizar template
exports.updateTemplate = async (req, res) => {
  try {
    const template = await Template.findOne({ 
      _id: req.params.id, 
      createdBy: req.user.id 
    });

    if (!template) {
      return res.status(404).json({ message: 'Template não encontrado' });
    }

    const { name, description, layout, zones, thumbnail, category, tags, isPublic } = req.body;

    if (name) template.name = name;
    if (description !== undefined) template.description = description;
    if (layout) template.layout = layout;
    
    if (zones) {
      if (!Array.isArray(zones) || zones.length === 0) {
        return res.status(400).json({ message: 'Template deve ter pelo menos uma zona' });
      }
      
      // Validar zonas
      for (const zone of zones) {
        if (!zone.type || !zone.position || !zone.size) {
          return res.status(400).json({ message: 'Cada zona deve ter type, position e size' });
        }
      }
      
      template.zones = zones;
    }
    
    if (thumbnail !== undefined) template.thumbnail = thumbnail;
    if (category !== undefined) template.category = category;
    if (tags) template.tags = tags;
    if (isPublic !== undefined) template.isPublic = isPublic;

    await template.save();
    res.json(template);
  } catch (error) {
    console.error('Erro ao atualizar template:', error);
    res.status(500).json({ message: 'Erro ao atualizar template', error: error.message });
  }
};

// Excluir template
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({ 
      _id: req.params.id, 
      createdBy: req.user.id 
    });

    if (!template) {
      return res.status(404).json({ message: 'Template não encontrado' });
    }

    res.json({ message: 'Template excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir template:', error);
    res.status(500).json({ message: 'Erro ao excluir template', error: error.message });
  }
};

// Duplicar template
exports.duplicateTemplate = async (req, res) => {
  try {
    const originalTemplate = await Template.findOne({ 
      _id: req.params.id 
    });

    if (!originalTemplate) {
      return res.status(404).json({ message: 'Template não encontrado' });
    }

    // Verificar permissões
    if (!originalTemplate.isPublic && originalTemplate.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const newTemplate = new Template({
      name: `${originalTemplate.name} (Cópia)`,
      description: originalTemplate.description,
      layout: originalTemplate.layout,
      zones: JSON.parse(JSON.stringify(originalTemplate.zones)), // Deep copy
      thumbnail: originalTemplate.thumbnail,
      category: originalTemplate.category,
      tags: originalTemplate.tags,
      isPublic: false,
      createdBy: req.user.id
    });

    await newTemplate.save();
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Erro ao duplicar template:', error);
    res.status(500).json({ message: 'Erro ao duplicar template', error: error.message });
  }
};

// Obter templates por categoria
exports.getTemplatesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    let query = { category, isPublic: true };
    
    const templates = await Template.find(query)
      .populate('createdBy', 'name')
      .sort({ name: 1 });

    res.json(templates);
  } catch (error) {
    console.error('Erro ao buscar templates por categoria:', error);
    res.status(500).json({ message: 'Erro ao buscar templates por categoria', error: error.message });
  }
};

// Aplicar template a uma tela
exports.applyTemplateToScreen = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { screenId, zoneUpdates } = req.body;

    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: 'Template não encontrado' });
    }

    const screen = await Screen.findById(screenId);
    if (!screen) {
      return res.status(404).json({ message: 'Tela não encontrada' });
    }

    // Verificar permissões
    if (!template.isPublic && template.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Aqui você pode implementar a lógica para aplicar o template à tela
    // Isso pode envolver criar uma playlist automática baseada nas zonas do template
    
    res.json({ 
      message: 'Template aplicado com sucesso',
      template,
      screen
    });
  } catch (error) {
    console.error('Erro ao aplicar template:', error);
    res.status(500).json({ message: 'Erro ao aplicar template', error: error.message });
  }
};

// Obter preview do template
exports.getTemplatePreview = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template não encontrado' });
    }

    // Gerar URL de preview (implementação dependente do seu sistema de storage)
    const previewUrl = `/api/templates/${template._id}/preview.png`;
    
    res.json({
      template,
      previewUrl
    });
  } catch (error) {
    console.error('Erro ao gerar preview:', error);
    res.status(500).json({ message: 'Erro ao gerar preview', error: error.message });
  }
};
