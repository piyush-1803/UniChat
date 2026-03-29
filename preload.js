const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  switchPlatform: (platform) => ipcRenderer.send('switch-platform', platform),
  onPlatformLoading: (cb) => ipcRenderer.on('platform-loading', (e, p) => cb(p)),
  onPlatformReady: (cb) => ipcRenderer.on('platform-ready', (e, p) => cb(p)),
  onUnreadCount: (cb) => ipcRenderer.on('unread-count', (e, data) => cb(data)),
  onForceSwitch: (cb) => ipcRenderer.on('force-switch', (e, p) => cb(p)),
  reloadPlatform: () => ipcRenderer.send('reload-platform')
});
