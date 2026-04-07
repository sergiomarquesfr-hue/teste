const { app, BrowserWindow, screen, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();
let mainWindow;
let isFullscreen = true;

// Configurações do player
const playerConfig = {
  serverUrl: store.get('serverUrl', 'http://localhost:5000'),
  deviceId: store.get('deviceId', null),
  deviceToken: store.get('deviceToken', null)
};

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width,
    height,
    fullscreen: isFullscreen,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  // Carregar o player HTML
  mainWindow.loadFile(path.join(__dirname, 'player.html'));

  // Abrir DevTools em modo desenvolvimento
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Registrar atalhos de teclado
function registerShortcuts() {
  // F11 para alternar fullscreen
  globalShortcut.register('F11', () => {
    if (mainWindow) {
      isFullscreen = !isFullscreen;
      mainWindow.setFullScreen(isFullscreen);
    }
  });

  // Ctrl+Q ou Alt+F4 para sair
  globalShortcut.register('CommandOrControl+Q', () => {
    app.quit();
  });

  // F5 para recarregar
  globalShortcut.register('F5', () => {
    if (mainWindow) {
      mainWindow.reload();
    }
  });
}

// IPC handlers para comunicação com o renderer
ipcMain.handle('get-device-id', () => {
  return playerConfig.deviceId;
});

ipcMain.handle('set-server-url', (event, url) => {
  playerConfig.serverUrl = url;
  store.set('serverUrl', url);
  return true;
});

ipcMain.handle('get-server-url', () => {
  return playerConfig.serverUrl;
});

ipcMain.handle('set-device-credentials', (event, { deviceId, deviceToken }) => {
  playerConfig.deviceId = deviceId;
  playerConfig.deviceToken = deviceToken;
  store.set('deviceId', deviceId);
  store.set('deviceToken', deviceToken);
  return true;
});

ipcMain.handle('clear-settings', () => {
  store.clear();
  playerConfig.deviceId = null;
  playerConfig.deviceToken = null;
  return true;
});

ipcMain.handle('restart-app', () => {
  app.relaunch();
  app.exit(0);
});

// Evento quando o app está pronto
app.whenReady().then(() => {
  registerShortcuts();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Fechar o app quando todas as janelas estiverem fechadas (exceto no macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Prevenir navegação para URLs externas
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== playerConfig.serverUrl) {
      event.preventDefault();
    }
  });
});

// Habilitar modo kiosk via linha de comando
if (process.argv.includes('--kiosk')) {
  app.commandLine.appendSwitch('kiosk');
  isFullscreen = true;
}
