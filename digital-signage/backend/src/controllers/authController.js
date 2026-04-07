const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Registrar usuário
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, role } = req.body;

    // Verificar se usuário já existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Usuário já cadastrado com este e-mail.' });
    }

    // Criptografar senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Criar usuário
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await user.save();

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
};

// Login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Verificar se usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    // Verificar senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
};

// Obter perfil do usuário
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ error: 'Erro ao obter perfil.' });
  }
};

// Listar usuários (admin)
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
};
