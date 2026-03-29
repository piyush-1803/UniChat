<div align="center">

# 💬 UniChat

**All your messaging. One window. Built for Windows.**

[![Version](https://img.shields.io/badge/version-1.0.0-4CAF50?style=flat-square)](https://github.com/piyush-1803/UniChat/releases)
[![Platform](https://img.shields.io/badge/platform-Windows-0078D4?style=flat-square&logo=windows)](https://github.com/piyush-1803/UniChat)
[![Built with Electron](https://img.shields.io/badge/built%20with-Electron-47848F?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![License](https://img.shields.io/badge/license-MIT-white?style=flat-square)](LICENSE)

![UniChat Screenshot](https://raw.githubusercontent.com/piyush-1803/UniChat/main/preview.png)

</div>

---

## What is UniChat?

UniChat is a native Windows desktop app that brings WhatsApp, Telegram, and Instagram DMs into a single clean interface — no browser tabs, no alt-tabbing, no chaos.

Inspired by [Texts](https://texts.blog) for macOS, built from scratch for Windows with a design language that actually feels at home on Windows 11.

---

## Features

- **Unified inbox** — WhatsApp, Telegram, and Instagram in one window
- **Persistent sessions** — stay logged in across all platforms, even after restart
- **Platform-adaptive theming** — UI accent color shifts to match the active platform (green, blue, pink)
- **Unread badges** — live notification counts on the dock icons
- **System tray integration** — hides to tray on close, always accessible
- **Global shortcuts** — control UniChat without even opening it
- **Dark / Light theme** — toggle from the Settings panel
- **Compact sidebar** — shrink the dock for more screen space
- **Refresh button** — reload the active platform instantly
- **Windows-native** — frameless window with custom titlebar, built for Windows 11

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Shift + U` | Toggle UniChat window |
| `Ctrl + 1` | Switch to WhatsApp |
| `Ctrl + 2` | Switch to Telegram |
| `Ctrl + 3` | Switch to Instagram |
| `Ctrl + ,` | Open / close Settings |

---

## Installation

### Option 1 — Download the installer (recommended)

Download `UniChat-Setup-1.0.0.exe` from the [Releases](https://github.com/piyush-1803/UniChat/releases) page and run it.

### Option 2 — Run from source

```bash
git clone https://github.com/piyush-1803/UniChat.git
cd UniChat
npm install
npm start
```

**Requirements:** Node.js 18+ and npm.

---

## How It Works

UniChat uses Electron's `BrowserView` API to embed WhatsApp Web, Telegram Web, and Instagram's DM inbox as isolated browser sessions inside a native window. Each platform runs in its own sandboxed partition — your login sessions are stored locally and never touch any external server.

```
┌──────────┬───────────────────┬──────────────────────────────┐
│ Platform │  Platform name    │                              │
│  dock    │  header           │     Live web app             │
│          ├───────────────────│     (WhatsApp / Telegram /   │
│  [WA]    │                   │      Instagram)              │
│  [TG]    │  conversations    │                              │
│  [IG]    │  loading...       │                              │
│          │                   │                              │
│  [⚙]    │                   │                              │
└──────────┴───────────────────┴──────────────────────────────┘
```

---

## Tech Stack

- [Electron](https://www.electronjs.org/) — cross-platform desktop runtime
- HTML / CSS / Vanilla JS — zero framework overhead
- `BrowserView` — isolated web session per platform
- `Tray` + `globalShortcut` — system integration

---

## Roadmap

- [ ] Proper `.ico` app icon
- [ ] Launch at Windows startup (Settings toggle wired up)
- [ ] Search across all platforms
- [ ] Do Not Disturb mode
- [ ] Custom CSS injection per platform
- [ ] More platforms: Discord, Messenger, Signal

---

## Contributing

PRs welcome. If something's broken or you want a new platform added, open an issue.

---

## Author

Built by [piyush-1803](https://github.com/piyush-1803) — 18-year-old gap year student, Patratu, Jharkhand.

---

<div align="center">
<sub>If this saved you from having 4 browser tabs open, give it a ⭐</sub>
</div>
