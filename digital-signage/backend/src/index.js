require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const screenRoutes = require('./routes/screenRoutes');
const playlistRoutes = require('./routes/playlistRoutes');

// Conectar ao banco de dados
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Criar diretório de uploads se não existir
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/screens', screenRoutes);
app.use('/api/playlists', playlistRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Digital Signage API está rodando!' });
});

// Socket.IO para comunicação em tempo real com dispositivos
io.on('connection', (socket) => {
  console.log('Dispositivo conectado:', socket.id);

  socket.on('register-device', (data) => {
    const { deviceId } = data;
    socket.join(`device:${deviceId}`);
    console.log(`Dispositivo ${deviceId} registrado no socket ${socket.id}`);
  });

  socket.on('heartbeat', async (data) => {
    const { deviceId } = data;
    // Emitir confirmação para o dispositivo
    io.to(`device:${deviceId}`).emit('heartbeat-ack', {
      timestamp: new Date(),
      status: 'received'
    });
  });

  socket.on('disconnect', () => {
    console.log('Dispositivo desconectado:', socket.id);
  });
});

// Função para enviar atualizações para dispositivos
const notifyDeviceUpdate = (deviceId) => {
  io.to(`device:${deviceId}`).emit('content-update', {
    message: 'Conteúdo atualizado',
    timestamp: new Date()
  });
};

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = { app, io, notifyDeviceUpdate };
