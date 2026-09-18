# 🎵 Cognix 3D Audio Visualizer — v3

![Cognix Studio](https://img.shields.io/badge/Developer-Abhi%20Raj%20Singh-00ffff?style=for-the-badge&logo=codeigniter)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=three.js)
![Web Audio API](https://img.shields.io/badge/Web_Audio-API-blue?style=for-the-badge)

A professional, high-performance 3D music visualizer built with Vanilla JavaScript and Three.js. This application captures real-time audio (microphone, browser tab, or a local file) and drives mesmerizing, audio-reactive 3D environments directly in your browser — no build tools required.

**Developed by Abhi Raj Singh at Cognix Studio.**
Official site: [cognixstudio.github.io](https://cognixstudio.github.io/)

## ✨ What's new in v3

- **👤 Local Profile** — save a display name and favorite color (stored in `localStorage`); you get a personal welcome greeting on return visits.
- **🔌 Source Monitor ("Connect box")** — a live status box showing exactly what's connected (mic / tab / file), its label, a live level meter, plus **⏸ Pause Input** and **⏻ Disconnect** controls. Dismissible with its own ✕ hide button; reappears via "👁️ Show Source Monitor".
- **👁️ Hide All / Big-Screen Mode** — one click (or `V`) hides every panel and the HUD for a clean, cursor-free display; click the canvas or press `V`/`Esc` to bring it back.
- **🔍 Preset Search** — filter the (now 21-preset) gallery by name.
- **🎲 Randomize** — jump to a random preset + random color (`S` key).
- **↺ Reset to Defaults** — restore all settings in one click (keeps your saved profile).
- **5 new visualizer presets** (see below), bringing the total to 21.
- Smoother transitions, custom scrollbars, and general UI polish across the panel.

## 🌌 21 Premium Visualizer Presets

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
17. **Spectrum Ribbon** *(new)* — a scrolling wireframe ribbon where each row is a snapshot of the frequency spectrum over time.
18. **Starfield Warp** *(new)* — a bass-reactive warp-speed starfield flying past the camera.
19. **Metaball Blobs** *(new)* — orbiting, organically deforming icosahedron blobs lit by a moving point light.
20. **Grid Wave** *(new)* — a rippling wireframe terrain radiating outward like water.
21. **Orbital Rings** *(new)* — concentric torus rings, each pulsing to its own frequency band.

## 🛠️ Tech Stack

- **HTML5 & CSS3** — glass-morphism UI, responsive layout, CSS custom properties.
- **Vanilla JavaScript (ES6+)** — modular ES module architecture, zero framework overhead.
- **Three.js** — WebGL rendering engine (loaded via CDN import map).
- **Web Audio API** — frequency/time-domain analysis, beat + BPM detection.
- **MediaRecorder API** — in-browser video capture of the canvas.
- **localStorage** — settings and local profile persistence.

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
| `V` | Hide All (big-screen mode) |
| `S` | Randomize Preset & Color |

## 🔌 Note on Tab Audio Control

Browsers don't allow one tab/site to remotely play, pause, or skip media playing in *another* tab — there's no web API for that, by design (security/privacy). The **Source Monitor**'s "Pause Input" button is the closest practical equivalent: it stops the visualizer from reacting to that captured stream without touching the original playback, and "Disconnect" fully drops the capture. Only local file playback (loaded via 📁 File) gets true play/pause/seek control, since the browser owns that audio element directly.

## 🎨 Branding

The app is now branded with the official Cognix Studio hexagonal mark:
- Custom favicon (32px / 64px / Apple touch icon)
- Animated logo on the boot/onboarding screen
- Logo mark in the control panel header and footer
- A direct link to [cognixstudio.github.io](https://cognixstudio.github.io/) in the control panel footer

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
    │   ├── AudioManager.js      # mic / tab / file source orchestration, pause/disconnect, source info
    │   ├── AudioCapture.js      # getUserMedia / getDisplayMedia
    │   └── AudioAnalyzer.js     # FFT analysis, beat + BPM detection
    ├── visualizer/
    │   ├── VisualizerEngine.js  # Three.js scene, render loop, HUD stats
    │   ├── PresetManager.js     # preset registry + metadata
    │   └── presets/             # 21 individual visualizer presets
    ├── ui/
    │   └── UIManager.js         # DOM wiring, shortcuts, drag & drop, profile, connect box, hide-all
    └── utils/
        ├── Toast.js             # non-blocking notifications
        ├── SettingsStore.js     # localStorage persistence (settings + profile)
        └── MediaExporter.js     # screenshot + video recording
```

## 👨‍💻 Author

**Abhi Raj Singh**
*Developer @ Cognix Studio*

Dedicated to pushing the boundaries of creative coding and immersive web experiences.

---
*© 2026 Cognix Studio. All Rights Reserved.*
