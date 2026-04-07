const Content = require('../models/Content');
const { validationResult } = require('express-validator');

// Criar conteúdo
exports.createContent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, type, url, duration, tags } = req.body;

    const content = new Content({
      title,
      description,
      type,
      url,
      duration,
      tags,
      uploadedBy: req.user._id,
      fileSize: req.file?.size,
      mimeType: req.file?.mimetype
    });

    await content.save();
    res.status(201).json({ content });
  } catch (error) {
    console.error('Erro ao criar conteúdo:', error);
    res.status(500).json({ error: 'Erro ao criar conteúdo.' });
  }
};

// Listar conteúdos
exports.listContents = async (req, res) => {
  try {
    const { type, isActive, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const contents = await Content.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Content.countDocuments(filter);

    res.json({
      contents,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Erro ao listar conteúdos:', error);
    res.status(500).json({ error: 'Erro ao listar conteúdos.' });
  }
};

// Obter conteúdo por ID
exports.getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('uploadedBy', 'name email');
    
    if (!content) {
      return res.status(404).json({ error: 'Conteúdo não encontrado.' });
    }

    res.json({ content });
  } catch (error) {
    console.error('Erro ao obter conteúdo:', error);
    res.status(500).json({ error: 'Erro ao obter conteúdo.' });
  }
};

// Atualizar conteúdo
exports.updateContent = async (req, res) => {
  try {
    const { title, description, duration, tags, isActive } = req.body;

    let content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Conteúdo não encontrado.' });
    }

    // Verificar permissão
    if (content.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para editar este conteúdo.' });
    }

    content.title = title || content.title;
    content.description = description || content.description;
    content.duration = duration || content.duration;
    content.tags = tags || content.tags;
    content.isActive = isActive !== undefined ? isActive : content.isActive;

    await content.save();
    res.json({ content });
  } catch (error) {
    console.error('Erro ao atualizar conteúdo:', error);
    res.status(500).json({ error: 'Erro ao atualizar conteúdo.' });
  }
};

// Deletar conteúdo
exports.deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Conteúdo não encontrado.' });
    }

    // Verificar permissão
    if (content.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para deletar este conteúdo.' });
    }

    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: 'Conteúdo deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar conteúdo:', error);
    res.status(500).json({ error: 'Erro ao deletar conteúdo.' });
  }
};
