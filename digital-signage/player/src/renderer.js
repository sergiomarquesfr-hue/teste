const { ipcRenderer } = require('electron');
const io = require('socket.io-client');

// Estado do player
let state = {
  deviceId: null,
  deviceToken: null,
  serverUrl: 'http://localhost:5000',
  socket: null,
  currentSchedule: null,
  currentPlaylist: null,
  currentIndex: 0,
  isPlaying: false,
  contentInterval: null
};

// Elementos DOM
const setupScreen = document.getElementById('setup-screen');
const playerContainer = document.getElementById('player-container');
const contentZones = document.getElementById('content-zones');
const statusBar = document.getElementById('status-bar');
const btnConnect = document.getElementById('btn-connect');
const btnOffline = document.getElementById('btn-offline');

// Inicialização
async function init() {
  // Carregar configurações salvas
  state.serverUrl = await ipcRenderer.invoke('get-server-url');
  state.deviceId = await ipcRenderer.invoke('get-device-id');
  
  document.getElementById('server-url').value = state.serverUrl;

  if (state.deviceId) {
    // Já tem dispositivo registrado, conectar automaticamente
    connectToDevice();
  } else {
    // Mostrar tela de setup
    showSetupScreen();
  }

  // Atualizar relógio
  setInterval(updateTime, 1000);
  updateTime();
}

function showSetupScreen() {
  setupScreen.classList.remove('hidden');
  playerContainer.style.display = 'none';
  statusBar.classList.add('hidden');
}

function showPlayer() {
  setupScreen.classList.add('hidden');
  playerContainer.style.display = 'block';
  statusBar.classList.remove('hidden');
}

// Conectar ao servidor
async function connectToDevice() {
  try {
    updateStatus('connection', 'Conectando...');

    // Conectar via Socket.IO
    state.socket = io(state.serverUrl, {
      query: { deviceId: state.deviceId },
      transports: ['websocket', 'polling']
    });

    state.socket.on('connect', () => {
      console.log('Conectado ao servidor');
      updateStatus('connection', 'Online');
      
      // Registrar dispositivo
      registerDevice();
    });

    state.socket.on('disconnect', () => {
      console.log('Desconectado do servidor');
      updateStatus('connection', 'Offline');
    });

    state.socket.on('schedule:update', async (data) => {
      console.log('Atualização de agendamento recebida', data);
      await loadActiveSchedule();
    });

    state.socket.on('schedule:remove', async (data) => {
      console.log('Agendamento removido', data);
      await loadActiveSchedule();
    });

    state.socket.on('content:update', async (data) => {
      console.log('Atualização de conteúdo recebida', data);
      await loadActiveSchedule();
    });

    state.socket.on('command', async (data) => {
      console.log('Comando recebido', data);
      handleCommand(data);
    });

  } catch (error) {
    console.error('Erro ao conectar:', error);
    updateStatus('connection', 'Erro');
  }
}

// Registrar dispositivo no servidor
async function registerDevice() {
  try {
    const response = await fetch(`${state.serverUrl}/api/screens/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deviceId: state.deviceId,
        name: `Player-${state.deviceId.substring(0, 8)}`,
        platform: 'electron',
        resolution: `${screen.width}x${screen.height}`
      })
    });

    if (response.ok) {
      const data = await response.json();
      state.deviceToken = data.token;
      await ipcRenderer.invoke('set-device-credentials', {
        deviceId: state.deviceId,
        deviceToken: state.deviceToken
      });
      
      updateStatus('device', `Device: ${data.screen?.name || state.deviceId.substring(0, 8)}`);
      showPlayer();
      await loadActiveSchedule();
    } else {
      throw new Error('Falha ao registrar dispositivo');
    }
  } catch (error) {
    console.error('Erro ao registrar dispositivo:', error);
    updateStatus('connection', 'Erro registro');
  }
}

// Carregar agendamento ativo
async function loadActiveSchedule() {
  try {
    const response = await fetch(`${state.serverUrl}/api/schedules/screen/${state.deviceId}/active`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.schedule && data.schedule.playlist) {
        state.currentSchedule = data.schedule;
        state.currentPlaylist = data.schedule.playlist;
        state.currentIndex = 0;
        
        updateStatus('content', `Playing: ${data.schedule.name}`);
        playPlaylist();
      } else {
        // Sem agendamento ativo, mostrar tela padrão
        showDefaultContent();
      }
    } else {
      showDefaultContent();
    }
  } catch (error) {
    console.error('Erro ao carregar agendamento:', error);
    showDefaultContent();
  }
}

// Tocar playlist
function playPlaylist() {
  if (!state.currentPlaylist || !state.currentPlaylist.items || state.currentPlaylist.items.length === 0) {
    showDefaultContent();
    return;
  }

  if (state.contentInterval) {
    clearInterval(state.contentInterval);
  }

  playCurrentContent();

  // Agendar próximo conteúdo
  const currentContent = state.currentPlaylist.items[state.currentIndex];
  const duration = (currentContent.duration || 10) * 1000;

  state.contentInterval = setInterval(() => {
    state.currentIndex = (state.currentIndex + 1) % state.currentPlaylist.items.length;
    playCurrentContent();
  }, duration);
}

// Tocar conteúdo atual
async function playCurrentContent() {
  const item = state.currentPlaylist.items[state.currentIndex];
  if (!item) return;

  contentZones.innerHTML = '';

  try {
    const contentUrl = item.content?.url || item.url;
    const contentType = item.content?.type || item.type;

    if (contentType === 'video') {
      const video = document.createElement('video');
      video.src = contentUrl;
      video.autoplay = true;
      video.muted = false;
      video.loop = false;
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      
      video.addEventListener('ended', () => {
        state.currentIndex = (state.currentIndex + 1) % state.currentPlaylist.items.length;
        playCurrentContent();
      });

      contentZones.appendChild(video);
    } else if (contentType === 'image') {
      const img = document.createElement('img');
      img.src = contentUrl;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      contentZones.appendChild(img);
    } else if (contentType === 'html' || contentType === 'webpage') {
      const iframe = document.createElement('iframe');
      iframe.src = contentUrl;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      contentZones.appendChild(iframe);
    } else {
      // Default: imagem
      const img = document.createElement('img');
      img.src = contentUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><rect fill="%23333" width="100%" height="100%"/><text fill="white" x="50%" y="50%" text-anchor="middle">Sem conteúdo</text></svg>';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      contentZones.appendChild(img);
    }

    updateStatus('content', `Playing: ${item.content?.name || 'Content'} (${state.currentIndex + 1}/${state.currentPlaylist.items.length})`);
  } catch (error) {
    console.error('Erro ao reproduzir conteúdo:', error);
  }
}

// Mostrar conteúdo padrão
function showDefaultContent() {
  contentZones.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div style="text-align: center;">
        <h1 style="font-size: 3em; margin-bottom: 20px;">🖥️ OptiSigns Player</h1>
        <p style="font-size: 1.5em;">Aguardando agendamento...</p>
        <p style="margin-top: 20px; opacity: 0.7;">Device ID: ${state.deviceId ? state.deviceId.substring(0, 8) : 'Não registrado'}</p>
      </div>
    </div>
  `;
}

// Lidar com comandos do servidor
async function handleCommand(data) {
  const { command, params } = data;

  switch (command) {
    case 'restart':
      await ipcRenderer.invoke('restart-app');
      break;
    
    case 'clear_cache':
      localStorage.clear();
      await ipcRenderer.invoke('restart-app');
      break;
    
    case 'screenshot':
      // Capturar screenshot e enviar para o servidor
      // Implementação futura
      break;
    
    case 'update_content':
      await loadActiveSchedule();
      break;
    
    case 'reboot':
      // Reiniciar dispositivo (depende da plataforma)
      break;
  }
}

// Atualizar status bar
function updateStatus(type, message) {
  const element = document.getElementById(`status-${type}`);
  if (element) {
    element.textContent = message;
  }
}

// Atualizar relógio
function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('pt-BR');
  const dateString = now.toLocaleDateString('pt-BR');
  updateStatus('time', `${dateString} ${timeString}`);
}

// Event listeners
btnConnect.addEventListener('click', async () => {
  const serverUrl = document.getElementById('server-url').value;
  const activationCode = document.getElementById('activation-code').value;

  if (!serverUrl) {
    alert('Por favor, informe a URL do servidor');
    return;
  }

  state.serverUrl = serverUrl;
  await ipcRenderer.invoke('set-server-url', serverUrl);

  // Gerar ou usar código de ativação
  if (activationCode) {
    // Validar código de ativação com o servidor
    try {
      const response = await fetch(`${serverUrl}/api/screens/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activationCode })
      });

      if (response.ok) {
        const data = await response.json();
        state.deviceId = data.deviceId;
        await ipcRenderer.invoke('set-device-credentials', {
          deviceId: state.deviceId,
          deviceToken: data.token
        });
        
        connectToDevice();
      } else {
        alert('Código de ativação inválido');
      }
    } catch (error) {
      alert('Erro ao conectar: ' + error.message);
    }
  } else {
    // Gerar novo deviceId
    state.deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
    await ipcRenderer.invoke('set-device-credentials', {
      deviceId: state.deviceId,
      deviceToken: null
    });
    
    connectToDevice();
  }
});

btnOffline.addEventListener('click', () => {
  showDefaultContent();
  showPlayer();
});

// Mostrar status bar ao mover o mouse
let hideTimeout;
document.addEventListener('mousemove', () => {
  statusBar.classList.add('visible');
  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    if (!state.isPlaying) {
      statusBar.classList.remove('visible');
    }
  }, 3000);
});

// Inicializar
init();
