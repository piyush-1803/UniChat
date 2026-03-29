document.getElementById('min-btn').onclick = () => window.electronAPI.minimize();
document.getElementById('max-btn').onclick = () => window.electronAPI.maximize();
document.getElementById('close-btn').onclick = () => window.electronAPI.close();

// Select all platform icons with a data-platform attribute
const platformIcons = document.querySelectorAll('.platform-icon[data-platform]');
const platformNameHeader = document.getElementById('conv-platform-name');
const accentColors = { whatsapp: '#25D366', telegram: '#2CA5E0', instagram: '#E1306C' };

platformIcons.forEach(icon => {
  icon.addEventListener('click', () => {
    // Remove 'active' class from all icons
    platformIcons.forEach(i => i.classList.remove('active'));
    
    // Add 'active' class to the clicked icon
    icon.classList.add('active');
    
    // Update the header text to the platform's title
    const platformName = icon.getAttribute('title');
    platformNameHeader.textContent = platformName;

    // Switch the underlying BrowserView
    const platform = icon.getAttribute('data-platform');
    window.electronAPI.switchPlatform(platform);

    // Update accent color
    document.documentElement.style.setProperty('--accent', accentColors[platform] || '#4CAF50');
  });
});

const platformNames = { whatsapp: 'WhatsApp', telegram: 'Telegram', instagram: 'Instagram' };

window.electronAPI.onPlatformLoading((platform) => {
  document.getElementById('loading-text').textContent = `Loading ${platformNames[platform]}…`;
  document.getElementById('loading-overlay').classList.remove('hidden');
});

window.electronAPI.onPlatformReady((platform) => {
  document.getElementById('loading-overlay').classList.add('hidden');
});

window.electronAPI.onUnreadCount(({ platform, count }) => {
  const badge = document.getElementById(`badge-${platform}`);
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
});

// Settings panel open/close
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const settingsClose = document.getElementById('settings-close');

settingsBtn.addEventListener('click', () => {
  settingsPanel.classList.toggle('hidden');
});

settingsClose.addEventListener('click', () => {
  settingsPanel.classList.add('hidden');
});

// Theme toggle
document.querySelectorAll('.toggle-btn[data-theme]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn[data-theme]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (btn.dataset.theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  });
});

// Compact sidebar toggle
document.getElementById('compact-toggle').addEventListener('change', (e) => {
  const dock = document.getElementById('platform-dock');
  const overlay = document.getElementById('loading-overlay');
  const panel = document.getElementById('settings-panel');

  if (e.target.checked) {
    dock.style.width = '48px';
    overlay.style.left = '308px';
    panel.style.left = '48px';
  } else {
    dock.style.width = '64px';
    overlay.style.left = '324px';
    panel.style.left = '64px';
  }
});

// Tray switch support
window.electronAPI.onForceSwitch((platform) => {
  const icon = document.querySelector(`.platform-icon[data-platform="${platform}"]`);
  if (icon) icon.click();
});

// Refresh button
document.getElementById('refresh-btn').addEventListener('click', () => {
  window.electronAPI.reloadPlatform();
  document.getElementById('loading-overlay').classList.remove('hidden');
});
