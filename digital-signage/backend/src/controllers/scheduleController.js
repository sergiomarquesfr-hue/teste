const Schedule = require('../models/Schedule');
const Playlist = require('../models/Playlist');
const Screen = require('../models/Screen');
const ScreenGroup = require('../models/ScreenGroup');
const Content = require('../models/Content');

// Criar agendamento
exports.createSchedule = async (req, res) => {
  try {
    const { name, playlistId, screenIds, groupIds, startDate, endDate, startTime, endTime, daysOfWeek, priority } = req.body;

    // Validar playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist não encontrada' });
    }

    // Validar telas e grupos
    const screens = screenIds ? await Screen.find({ _id: { $in: screenIds } }) : [];
    const groups = groupIds ? await ScreenGroup.find({ _id: { $in: groupIds } }) : [];

    if (screenIds && screens.length !== screenIds.length) {
      return res.status(404).json({ message: 'Uma ou mais telas não encontradas' });
    }

    if (groupIds && groups.length !== groupIds.length) {
      return res.status(404).json({ message: 'Um ou mais grupos não encontrados' });
    }

    const schedule = new Schedule({
      name,
      playlist: playlistId,
      screens: screenIds || [],
      groups: groupIds || [],
      startDate: startDate || new Date(),
      endDate,
      startTime,
      endTime,
      daysOfWeek: daysOfWeek || [0, 1, 2, 3, 4, 5, 6], // Todos os dias por padrão
      priority: priority || 0,
      createdBy: req.user.id
    });

    await schedule.save();

    // Notificar telas afetadas via socket
    const affectedScreenIds = [
      ...screenIds,
      ...groups.flatMap(g => g.screens)
    ];
    
    if (affectedScreenIds.length > 0) {
      const io = req.app.get('io');
      if (io) {
        affectedScreenIds.forEach(screenId => {
          io.to(`screen:${screenId}`).emit('schedule:update', { scheduleId: schedule._id });
        });
      }
    }

    res.status(201).json(schedule);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ message: 'Erro ao criar agendamento', error: error.message });
  }
};

// Obter todos os agendamentos
exports.getSchedules = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, screenId, groupId } = req.query;
    
    let query = { createdBy: req.user.id };
    
    if (status) {
      const now = new Date();
      if (status === 'active') {
        query.startDate = { $lte: now };
        query.$or = [
          { endDate: { $gte: now } },
          { endDate: null }
        ];
      } else if (status === 'scheduled') {
        query.startDate = { $gt: now };
      } else if (status === 'expired') {
        query.endDate = { $lt: now };
      }
    }

    if (screenId) {
      query.$or = [
        { screens: screenId },
        { groups: { $in: await ScreenGroup.find({ screens: screenId }).distinct('_id') } }
      ];
    }

    if (groupId) {
      query.groups = groupId;
    }

    const schedules = await Schedule.find(query)
      .populate('playlist', 'name thumbnail')
      .populate('screens', 'name status')
      .populate('groups', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Schedule.countDocuments(query);

    res.json({
      schedules,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ message: 'Erro ao buscar agendamentos', error: error.message });
  }
};

// Obter agendamento por ID
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('playlist')
      .populate('screens', 'name status lastSeen')
      .populate('groups');

    if (!schedule) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    if (schedule.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ message: 'Erro ao buscar agendamento', error: error.message });
  }
};

// Atualizar agendamento
exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ 
      _id: req.params.id, 
      createdBy: req.user.id 
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    const { name, playlistId, screenIds, groupIds, startDate, endDate, startTime, endTime, daysOfWeek, priority, active } = req.body;

    if (playlistId) {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        return res.status(404).json({ message: 'Playlist não encontrada' });
      }
      schedule.playlist = playlistId;
    }

    if (name) schedule.name = name;
    if (screenIds !== undefined) schedule.screens = screenIds;
    if (groupIds !== undefined) schedule.groups = groupIds;
    if (startDate) schedule.startDate = startDate;
    if (endDate !== undefined) schedule.endDate = endDate;
    if (startTime !== undefined) schedule.startTime = startTime;
    if (endTime !== undefined) schedule.endTime = endTime;
    if (daysOfWeek) schedule.daysOfWeek = daysOfWeek;
    if (priority !== undefined) schedule.priority = priority;
    if (active !== undefined) schedule.active = active;

    await schedule.save();

    // Notificar telas afetadas
    const affectedScreenIds = [
      ...schedule.screens,
      ...(await ScreenGroup.find({ _id: { $in: schedule.groups } }).distinct('screens'))
    ];

    if (affectedScreenIds.length > 0) {
      const io = req.app.get('io');
      if (io) {
        affectedScreenIds.forEach(screenId => {
          io.to(`screen:${screenId}`).emit('schedule:update', { scheduleId: schedule._id });
        });
      }
    }

    res.json(schedule);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ message: 'Erro ao atualizar agendamento', error: error.message });
  }
};

// Excluir agendamento
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndDelete({ 
      _id: req.params.id, 
      createdBy: req.user.id 
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    // Notificar telas afetadas
    const affectedScreenIds = [
      ...schedule.screens,
      ...(await ScreenGroup.find({ _id: { $in: schedule.groups } }).distinct('screens'))
    ];

    if (affectedScreenIds.length > 0) {
      const io = req.app.get('io');
      if (io) {
        affectedScreenIds.forEach(screenId => {
          io.to(`screen:${screenId}`).emit('schedule:remove', { scheduleId: schedule._id });
        });
      }
    }

    res.json({ message: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).json({ message: 'Erro ao excluir agendamento', error: error.message });
  }
};

// Obter agendamento ativo para uma tela
exports.getActiveScheduleForScreen = async (req, res) => {
  try {
    const { screenId } = req.params;
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM

    const screen = await Screen.findById(screenId);
    if (!screen) {
      return res.status(404).json({ message: 'Tela não encontrada' });
    }

    // Buscar agendamentos ativos para esta tela
    const schedules = await Schedule.find({
      $or: [
        { screens: screenId },
        { groups: { $in: await ScreenGroup.find({ screens: screenId }).distinct('_id') } }
      ],
      active: true,
      startDate: { $lte: now },
      $or: [
        { endDate: { $gte: now } },
        { endDate: null }
      ],
      daysOfWeek: currentDay,
      $or: [
        { startTime: { $lte: currentTime }, endTime: { $gte: currentTime } },
        { startTime: null, endTime: null }
      ]
    })
    .populate('playlist')
    .sort({ priority: -1, createdAt: -1 });

    if (schedules.length === 0) {
      return res.json({ schedule: null, message: 'Nenhum agendamento ativo' });
    }

    // Retornar o agendamento de maior prioridade
    res.json({ schedule: schedules[0] });
  } catch (error) {
    console.error('Erro ao buscar agendamento ativo:', error);
    res.status(500).json({ message: 'Erro ao buscar agendamento ativo', error: error.message });
  }
};

// Duplicar agendamento
exports.duplicateSchedule = async (req, res) => {
  try {
    const originalSchedule = await Schedule.findOne({ 
      _id: req.params.id, 
      createdBy: req.user.id 
    }).populate('playlist');

    if (!originalSchedule) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    const newSchedule = new Schedule({
      name: `${originalSchedule.name} (Cópia)`,
      playlist: originalSchedule.playlist._id,
      screens: originalSchedule.screens,
      groups: originalSchedule.groups,
      startDate: new Date(),
      endDate: originalSchedule.endDate,
      startTime: originalSchedule.startTime,
      endTime: originalSchedule.endTime,
      daysOfWeek: originalSchedule.daysOfWeek,
      priority: originalSchedule.priority,
      active: false,
      createdBy: req.user.id
    });

    await newSchedule.save();
    res.status(201).json(newSchedule);
  } catch (error) {
    console.error('Erro ao duplicar agendamento:', error);
    res.status(500).json({ message: 'Erro ao duplicar agendamento', error: error.message });
  }
};
