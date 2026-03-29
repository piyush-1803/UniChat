const electron = require('electron');
const { app, BrowserWindow, BrowserView, ipcMain, session, Tray, Menu, globalShortcut, nativeImage } = electron;
const path = require('path');

const PLATFORMS = {
  whatsapp: {
    url: 'https://web.whatsapp.com',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  telegram: {
    url: 'https://web.telegram.org/a/',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  instagram: {
    url: 'https://www.instagram.com/direct/inbox/',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
};

let mainWindow;
let tray;
const views = {};
let activePlatform = 'whatsapp';

// Calculate the chat panel bounds (right portion of window)
// Dock=64px, ConvPanel=260px, Titlebar=38px
const DOCK_WIDTH = 64;
const CONV_WIDTH = 260;
const TITLEBAR_HEIGHT = 38;

function getChatBounds(win) {
  const [w, h] = win.getContentSize();
  return {
    x: DOCK_WIDTH + CONV_WIDTH,
    y: TITLEBAR_HEIGHT,
    width: Math.max(0, w - DOCK_WIDTH - CONV_WIDTH),
    height: Math.max(0, h - TITLEBAR_HEIGHT)
  };
}

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 800,
    minHeight: 550,
    frame: false,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile('index.html');

  // Create tray icon using a colored nativeImage (16x16 green dot)
  const trayIconSize = 16;
  const canvas = Buffer.alloc(trayIconSize * trayIconSize * 4);
  for (let i = 0; i < canvas.length; i += 4) {
    canvas[i] = 76;     // R
    canvas[i+1] = 175;  // G
    canvas[i+2] = 80;   // B
    canvas[i+3] = 255;  // A
  }
  const trayIcon = nativeImage.createFromBuffer(canvas, { width: trayIconSize, height: trayIconSize });

  tray = new Tray(trayIcon);
  tray.setToolTip('UniChat');

  const trayMenu = Menu.buildFromTemplate([
    { label: 'Open UniChat', click: () => { mainWindow.show(); mainWindow.focus(); } },
    { type: 'separator' },
    {
      label: 'WhatsApp', click: () => {
        mainWindow.show();
        mainWindow.webContents.send('force-switch', 'whatsapp');
        switchToView('whatsapp');
      }
    },
    {
      label: 'Telegram', click: () => {
        mainWindow.show();
        mainWindow.webContents.send('force-switch', 'telegram');
        switchToView('telegram');
      }
    },
    {
      label: 'Instagram', click: () => {
        mainWindow.show();
        mainWindow.webContents.send('force-switch', 'instagram');
        switchToView('instagram');
      }
    },
    { type: 'separator' },
    { label: 'Quit UniChat', click: () => { app.isQuitting = true; app.quit(); } }
  ]);

  tray.setContextMenu(trayMenu);
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Intercept window close → hide to tray instead of quitting
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  // Global keyboard shortcut to toggle window
  globalShortcut.register('CommandOrControl+Shift+U', () => {
    if (mainWindow.isVisible() && mainWindow.isFocused()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Create a BrowserView for each platform
  for (const [name, config] of Object.entries(PLATFORMS)) {
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        partition: `persist:${name}`,  // separate session per platform
        userAgent: config.userAgent
      }
    });
    view.webContents.loadURL(config.url);
    views[name] = view;

    if (name === 'whatsapp') {
      view.webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    }

    // Loading indicator events
    view.webContents.on('did-start-loading', () => {
      mainWindow.webContents.send('platform-loading', name);
    });

    view.webContents.on('did-stop-loading', () => {
      mainWindow.webContents.send('platform-ready', name);
    });

    // Unread badge detection (page title watcher)
    view.webContents.on('page-title-updated', (event, title) => {
      const match = title.match(/\((\d+)\)/);
      const count = match ? parseInt(match[1]) : 0;
      mainWindow.webContents.send('unread-count', { platform: name, count });
    });
  }

  // Set User-Agent for WhatsApp session requests
  if (views['whatsapp']) {
    views['whatsapp'].webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      callback({ requestHeaders: details.requestHeaders });
    });
  }

  // Show whatsapp view by default after window loads
  mainWindow.webContents.once('did-finish-load', () => {
    switchToView('whatsapp');
  });

  // Resize views when window resizes
  let resizeTimer;
  mainWindow.on('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (activePlatform && views[activePlatform]) {
        const bounds = getChatBounds(mainWindow);
        if (bounds.width > 0 && bounds.height > 0) {
          views[activePlatform].setBounds(bounds);
        }
      }
    }, 150);
  });

  // IPC: switch platform
  ipcMain.on('switch-platform', (event, platform) => {
    switchToView(platform);
  });

  // IPC: reload platform
  ipcMain.on('reload-platform', () => {
    if (views[activePlatform]) {
      views[activePlatform].webContents.reload();
    }
  });

  // IPC: window controls
  ipcMain.on('window-minimize', () => mainWindow.minimize());
  let maximizeThrottled = false;
  ipcMain.on('window-maximize', () => {
    if (maximizeThrottled) return;
    maximizeThrottled = true;
    setTimeout(() => { maximizeThrottled = false; }, 300);

    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });


  ipcMain.on('window-close', () => mainWindow.close());
});

app.on('before-quit', () => { 
  app.isQuitting = true; 
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

function switchToView(platform) {
  if (!views[platform]) return;

  // Remove current view
  if (activePlatform && views[activePlatform]) {
    mainWindow.removeBrowserView(views[activePlatform]);
  }

  activePlatform = platform;
  const view = views[platform];
  mainWindow.addBrowserView(view);
  view.setBounds(getChatBounds(mainWindow));

  // Loading indicator for active switch
  mainWindow.webContents.send('platform-loading', platform);

  view.webContents.focus();
}
