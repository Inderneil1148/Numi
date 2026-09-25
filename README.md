# Numi — Minimal Expense & Tag Tracker

Numi is a minimal, mobile-first personal finance tracker and expense manager designed with Google Material Design 3 (Material You) aesthetics, precision budgeting, custom tagging, and progressive web app (PWA) offline capabilities.

![Numi Android Experience](public/pwa-512x512.png)

## Features

- **Material Design 3 (Material You) Interface**: Clean Google Blue palette, tonal surface containers, elevated cards, and floating action button (FAB).
- **Google Pixel Phone Simulator**: Dual display modes—an authentic Android phone frame with punch-hole camera and system navigation for desktop preview, and full edge-to-edge responsive layout on actual mobile devices.
- **Android System Navigation**:
  - **3-Button Navigation (◀ ⬤ ■)**: Hardware-calibrated Back, Home, and Recents buttons.
  - **Recent Apps Multitasking Switcher**: Multitasking carousel showing active application state and quick actions.
  - **Interactive Quick Settings & Notification Shade**: Pull-down shade with Wi-Fi, Bluetooth, Dark Mode, Flashlight, and actionable budget notification cards.
  - **Gesture Bar**: Toggle between 3-Button Nav and modern gesture pill.
- **Custom Tagging Engine**: Color-coded custom tags, multi-tag filtering, tag spend analytics, and instant tag-based transaction querying.
- **Precision Budgeting & Insights**:
  - Monthly budget limit tracker with real-time linear progress and pacing alerts.
  - Inflow vs outflow cash flow breakdown.
  - Net savings rate metric.
  - Category breakdown with spend volume and transaction frequencies.
- **Tactile Android Haptic Engine**:
  - Calibrated vibration patterns aligned with Android `VibrationEffect` standards (`EFFECT_CLICK`, `EFFECT_TICK`, `EFFECT_HEAVY_CLICK`, `DOUBLE_CLICK`).
  - Web Audio acoustic tap sound simulation as a universal tactile fallback.
- **Offline & Progressive Web App (PWA)**:
  - Installable directly to Android Home screens via WebAPK.
  - Full offline support with Workbox service worker caching.
  - Safe-area inset protection for mobile viewports.
- **Data Privacy & Portability**:
  - 100% local client-side storage—no servers tracking personal finances.
  - One-click JSON backup and restore.
  - CSV spreadsheet export compatible with Google Sheets and Microsoft Excel.

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/username/numi-finance.git

# Navigate into directory
cd numi-finance

# Install dependencies
npm install

# Start local development server (Port 3000)
npm run dev
```

### Production Build

```bash
# Type check and build production bundle
npm run build

# Preview production build locally
npm run preview
```

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/) + [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **PWA & Offline**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Icons**: [Lucide React](https://lucide.dev/)

## License

MIT License. Designed with focus on clarity, simplicity, and speed.
