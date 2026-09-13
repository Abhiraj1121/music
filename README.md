# 🎵 Cognix 3D Audio Visualizer — v2

![Cognix Studio](https://img.shields.io/badge/Developer-Abhi%20Raj%20Singh-00ffff?style=for-the-badge&logo=codeigniter)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=three.js)
![Web Audio API](https://img.shields.io/badge/Web_Audio-API-blue?style=for-the-badge)

A professional, high-performance 3D music visualizer built with Vanilla JavaScript and Three.js. This application captures real-time audio (microphone, browser tab, or a local file) and drives mesmerizing, audio-reactive 3D environments directly in your browser — no build tools required.

**Developed by Abhi Raj Singh at Cognix Studio.**

## ✨ What's new in v2

- **🎤 Microphone Input** — visualize live sound from your mic, not just tab/file audio.
- **📊 Live HUD** — real-time FPS counter, estimated BPM (tempo detection from beat spacing), and an input level meter.
- **🌊 Mini Waveform** — a live oscilloscope-style waveform in the header.
- **🎛️ Visual Preset Gallery** — a tappable icon grid instead of a dropdown, with the active preset highlighted.
- **🔀 Auto-Cycle Mode** — automatically rotate through presets on a timer.
- **📸 Screenshot Export** — save the current frame as a PNG.
- **🎥 Video Recording** — record the canvas straight to a downloadable `.webm` via `MediaRecorder`.
- **⌨️ Keyboard Shortcuts** — Space, F, H, C, R, M, arrow keys, and number keys 1–9 (see in-app cheat sheet).
- **💾 Settings Persistence** — your preset, color, sensitivity, and other preferences are remembered via `localStorage`.
- **🧊 Onboarding Overlay** — a friendly first-run screen to pick your audio source.
- **📂 Drag & Drop** — drop an audio file anywhere on the page to play it.
- **🍞 Toast Notifications** — clear, non-blocking feedback instead of browser `alert()` popups.
- **📱 Responsive UI** — collapsible sections and touch-friendly controls for mobile/tablet.

## 🌌 16 Premium Visualizer Presets

1. **Cosmic Nebula** — a deep-space particle cloud that scales and rotates with the bass.
2. **Neon Tunnel** — an infinite wireframe tunnel that pulses to the beat.
3. **Liquid Geometry** — a smooth sphere mesh deformed by frequency displacement.
4. **Kaleidoscope** — expanding, symmetrical geometry reflecting track energy.
5. **Energy Vortex** — swirling, distorted spiral lines forming a 3D vortex.
6. **Audio Cube** — a wireframe cube with an inner cube reacting to the beat.
7. **Frequency Bars** — a 3D circular spectrum analyzer with 64 bars.
8. **Stardust Grid** — a retro undulating floor of particles.
9. **Quantum Strings** — 3D spline lines driven by raw waveform data.
10. **Pulsar Star** — a glowing core with orbital particle rings.
11. **Fluid Bars** — a curved array of metallic cylinders forming a liquid wave.
12. **Hexagon Matrix** — a honeycomb grid of hexagonal prisms rippling outward on the beat, a tribute to the Cognix Studio brand mark.
13. **DNA Helix** — a twisting double helix of glowing nodes with connecting rungs.
14. **Crystal Shatter** — a faceted crystal that shatters into independent shards on every beat, then reforms.
15. **Aurora Waves** — layered, glowing ribbon planes rippling like the northern lights.
16. **Galaxy Spiral** — an 8,000-particle barred spiral galaxy with a pulsing core.

## 🛠️ Tech Stack

- **HTML5 & CSS3** — glass-morphism UI, responsive layout, CSS custom properties.
- **Vanilla JavaScript (ES6+)** — modular ES module architecture, zero framework overhead.
- **Three.js** — WebGL rendering engine (loaded via CDN import map).
- **Web Audio API** — frequency/time-domain analysis, beat + BPM detection.
- **MediaRecorder API** — in-browser video capture of the canvas.
- **localStorage** — lightweight settings persistence.

## 🚀 How to Run Locally

Because this project uses native ES Modules (`<script type="module">`), you must serve it over HTTP rather than opening `index.html` directly from disk.

### Using Python (Recommended)
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

### Using Node.js / NPX
```bash
npx serve .
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `F` | Toggle Fullscreen |
| `H` | Hide / Show UI |
| `C` | Take Screenshot |
| `R` | Start / Stop Recording |
| `←` / `→` | Previous / Next Preset |
| `1`–`9` | Jump to Preset |
| `M` | Toggle Rainbow Mode |

## 🎨 Branding

The app is now branded with the official Cognix Studio hexagonal mark:
- Custom favicon (32px / 64px / Apple touch icon)
- Animated logo on the boot/onboarding screen
- Logo mark in the control panel header and footer

Brand assets live in `assets/` and were derived from the Cognix Studio logo with a transparency pass so the mark sits cleanly on the app's dark UI without a background box.

## 📁 Project Structure

```
3d-music-visualizer/
├── index.html
├── assets/
│   ├── cognix-logo.png          # boot-screen brand mark (transparent)
│   ├── cognix-favicon-32.png
│   ├── cognix-favicon-64.png
│   └── cognix-favicon-180.png   # Apple touch icon
├── styles/
│   └── main.css
└── src/
    ├── main.js
    ├── audio/
    │   ├── AudioManager.js      # mic / tab / file source orchestration
    │   ├── AudioCapture.js      # getUserMedia / getDisplayMedia
    │   └── AudioAnalyzer.js     # FFT analysis, beat + BPM detection
    ├── visualizer/
    │   ├── VisualizerEngine.js  # Three.js scene, render loop, HUD stats
    │   ├── PresetManager.js     # preset registry + metadata
    │   └── presets/             # 16 individual visualizer presets
    ├── ui/
    │   └── UIManager.js         # DOM wiring, shortcuts, drag & drop
    └── utils/
        ├── Toast.js             # non-blocking notifications
        ├── SettingsStore.js     # localStorage persistence
        └── MediaExporter.js     # screenshot + video recording
```

## 👨‍💻 Author

**Abhi Raj Singh**
*Developer @ Cognix Studio*

Dedicated to pushing the boundaries of creative coding and immersive web experiences.

---
*© 2026 Cognix Studio. All Rights Reserved.*
