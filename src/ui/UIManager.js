import { PRESET_META } from '../visualizer/PresetManager.js';
import { MediaExporter } from '../utils/MediaExporter.js';
import { Toast } from '../utils/Toast.js';
import { SettingsStore } from '../utils/SettingsStore.js';

export class UIManager {
    constructor(audioManager, visualizerEngine) {
        this.audioManager = audioManager;
        this.visualizerEngine = visualizerEngine;
        this.toast = new Toast();
        this.settings = new SettingsStore();
        this.exporter = new MediaExporter(document.getElementById('visualizer-canvas'));

        this.initDOM();
        this.buildPresetGallery();
        this.applySavedSettings();
        this.bindEvents();
        this.bindKeyboardShortcuts();
        this.bindDragAndDrop();
        this.startWaveformLoop();
        this.startHudLoop();

        // Listen for audio + preset events
        this.audioManager.onStatusChange = (status, tone) => this.updateStatus(status, tone);
        this.audioManager.onError = (msg) => this.toast.error(msg);
        this.audioManager.onSourceChange = (type) => this.onSourceChange(type);

        this.visualizerEngine.presetManager.onPresetChange = (name) => this.highlightActivePreset(name);
        this.visualizerEngine.onPresetAutoSwitch = (name) => {
            this.toast.info(`Auto-switched to ${PRESET_META[name]?.label || name}`);
        };
    }

    initDOM() {
        this.bootOverlay = document.getElementById('boot-overlay');
        this.dropzoneOverlay = document.getElementById('dropzone-overlay');
        this.uiContainer = document.getElementById('ui-container');
        this.btnShowUI = document.getElementById('btn-show-ui');
        this.statusEl = document.getElementById('audio-status');
        this.playbackControls = document.getElementById('playback-controls');
        this.hud = document.getElementById('hud');

        // Boot overlay buttons
        this.bootBtnFile = document.getElementById('boot-btn-file');
        this.bootBtnMic = document.getElementById('boot-btn-mic');
        this.bootBtnTab = document.getElementById('boot-btn-tab');
        this.bootBtnSkip = document.getElementById('boot-btn-skip');

        // Source buttons
        this.btnCaptureTab = document.getElementById('btn-capture-tab');
        this.btnCaptureMic = document.getElementById('btn-capture-mic');
        this.audioUpload = document.getElementById('audio-upload');
        this.btnPlayPause = document.getElementById('btn-play-pause');
        this.btnFullscreen = document.getElementById('btn-fullscreen');
        this.btnToggleUI = document.getElementById('btn-toggle-ui');
        this.btnShortcuts = document.getElementById('btn-shortcuts');
        this.btnCloseShortcuts = document.getElementById('btn-close-shortcuts');
        this.shortcutsModal = document.getElementById('shortcuts-modal');

        // Capture
        this.btnScreenshot = document.getElementById('btn-screenshot');
        this.btnRecord = document.getElementById('btn-record');

        // Inputs
        this.volumeSlider = document.getElementById('volume-slider');
        this.seekSlider = document.getElementById('seek-slider');
        this.timeCurrent = document.getElementById('time-current');
        this.timeDuration = document.getElementById('time-duration');
        this.sensitivitySlider = document.getElementById('sensitivity-slider');
        this.sensitivityVal = document.getElementById('sensitivity-val');
        this.primaryColor = document.getElementById('primary-color');
        this.rainbowMode = document.getElementById('rainbow-mode');
        this.hudToggle = document.getElementById('hud-toggle');
        this.autoCycle = document.getElementById('auto-cycle');
        this.autoCycleIntervalRow = document.getElementById('auto-cycle-interval-row');
        this.autoCycleInterval = document.getElementById('auto-cycle-interval');
        this.autoCycleIntervalVal = document.getElementById('auto-cycle-interval-val');

        // HUD elements
        this.hudFps = document.getElementById('hud-fps');
        this.hudBpm = document.getElementById('hud-bpm');
        this.hudLevelFill = document.getElementById('hud-level-fill');

        // Waveform
        this.waveformCanvas = document.getElementById('mini-waveform');
        this.waveformCtx = this.waveformCanvas.getContext('2d');

        this.presetGallery = document.getElementById('preset-gallery');
    }

    buildPresetGallery() {
        const names = this.visualizerEngine.getPresetList();
        this.presetGallery.innerHTML = '';
        names.forEach(name => {
            const meta = PRESET_META[name] || { label: name, icon: '🎛️' };
            const tile = document.createElement('div');
            tile.className = 'preset-tile';
            tile.dataset.preset = name;
            tile.innerHTML = `<span class="preset-icon">${meta.icon}</span><span class="preset-name">${meta.label}</span>`;
            tile.addEventListener('click', () => {
                this.visualizerEngine.setPreset(name);
                this.settings.set('preset', name);
            });
            this.presetGallery.appendChild(tile);
        });
    }

    highlightActivePreset(name) {
        this.presetGallery.querySelectorAll('.preset-tile').forEach(tile => {
            tile.classList.toggle('active', tile.dataset.preset === name);
        });
    }

    applySavedSettings() {
        const s = this.settings.getAll();

        this.visualizerEngine.setPreset(s.preset);
        this.visualizerEngine.setSensitivity(s.sensitivity);
        this.visualizerEngine.setPrimaryColor(s.primaryColor);
        this.visualizerEngine.setRainbowMode(s.rainbowMode);
        this.visualizerEngine.setAutoCycle(s.autoCycle, s.autoCycleInterval);

        this.sensitivitySlider.value = s.sensitivity;
        this.sensitivityVal.textContent = Number(s.sensitivity).toFixed(1);
        this.primaryColor.value = s.primaryColor;
        this.primaryColor.disabled = s.rainbowMode;
        this.rainbowMode.checked = s.rainbowMode;
        this.volumeSlider.value = s.volume;
        this.autoCycle.checked = s.autoCycle;
        this.autoCycleInterval.value = s.autoCycleInterval;
        this.autoCycleIntervalVal.textContent = `${s.autoCycleInterval}s`;
        this.autoCycleIntervalRow.style.display = s.autoCycle ? 'flex' : 'none';
        this.hudToggle.checked = s.showHud;
        this.hud.classList.toggle('hidden', !s.showHud);
    }

    bindEvents() {
        // --- Boot overlay ---
        this.bootBtnFile.addEventListener('click', () => {
            this.dismissBoot();
            this.audioUpload.click();
        });
        this.bootBtnMic.addEventListener('click', async () => {
            this.dismissBoot();
            await this.handleMicCapture();
        });
        this.bootBtnTab.addEventListener('click', async () => {
            this.dismissBoot();
            await this.handleTabCapture();
        });
        this.bootBtnSkip.addEventListener('click', () => this.dismissBoot());

        // --- Audio Controls ---
        this.btnCaptureTab.addEventListener('click', () => this.handleTabCapture());
        this.btnCaptureMic.addEventListener('click', () => this.handleMicCapture());

        this.audioUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) await this.handleFileLoad(file);
        });

        this.btnPlayPause.addEventListener('click', () => this.togglePlayback());

        this.volumeSlider.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            this.audioManager.setVolume(v);
            this.settings.set('volume', v);
        });

        this.seekSlider.addEventListener('input', (e) => {
            this.audioManager.seek(parseFloat(e.target.value) / 1000);
        });

        // --- Visualizer Controls ---
        this.sensitivitySlider.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            this.visualizerEngine.setSensitivity(v);
            this.sensitivityVal.textContent = v.toFixed(1);
            this.settings.set('sensitivity', v);
        });

        this.primaryColor.addEventListener('input', (e) => {
            this.visualizerEngine.setPrimaryColor(e.target.value);
            this.settings.set('primaryColor', e.target.value);
            if (this.rainbowMode.checked) {
                this.rainbowMode.checked = false;
                this.visualizerEngine.setRainbowMode(false);
                this.settings.set('rainbowMode', false);
            }
        });

        this.rainbowMode.addEventListener('change', (e) => {
            this.visualizerEngine.setRainbowMode(e.target.checked);
            this.primaryColor.disabled = e.target.checked;
            this.settings.set('rainbowMode', e.target.checked);
        });

        this.hudToggle.addEventListener('change', (e) => {
            this.hud.classList.toggle('hidden', !e.target.checked);
            this.settings.set('showHud', e.target.checked);
        });

        this.autoCycle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            this.visualizerEngine.setAutoCycle(enabled, parseInt(this.autoCycleInterval.value, 10));
            this.autoCycleIntervalRow.style.display = enabled ? 'flex' : 'none';
            this.settings.set('autoCycle', enabled);
        });

        this.autoCycleInterval.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            this.autoCycleIntervalVal.textContent = `${val}s`;
            this.visualizerEngine.setAutoCycle(this.autoCycle.checked, val);
            this.settings.set('autoCycleInterval', val);
        });

        // --- Capture ---
        this.btnScreenshot.addEventListener('click', () => this.takeScreenshot());
        this.btnRecord.addEventListener('click', () => this.toggleRecording());

        // --- UI Controls ---
        this.btnToggleUI.addEventListener('click', () => this.toggleUI(false));
        this.btnShowUI.addEventListener('click', () => this.toggleUI(true));
        this.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());

        this.btnShortcuts.addEventListener('click', () => this.shortcutsModal.classList.remove('hidden'));
        this.btnCloseShortcuts.addEventListener('click', () => this.shortcutsModal.classList.add('hidden'));
        this.shortcutsModal.addEventListener('click', (e) => {
            if (e.target === this.shortcutsModal) this.shortcutsModal.classList.add('hidden');
        });

        // Hide UI on double click canvas -> fullscreen toggle
        document.getElementById('visualizer-canvas').addEventListener('dblclick', () => {
            this.toggleFullscreen();
        });
    }

    bindKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            // Ignore when typing in inputs
            if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    this.togglePlayback();
                    break;
                case 'f':
                    this.toggleFullscreen();
                    break;
                case 'h':
                    this.toggleUI(this.uiContainer.classList.contains('hidden'));
                    break;
                case 'c':
                    this.takeScreenshot();
                    break;
                case 'r':
                    this.toggleRecording();
                    break;
                case 'm':
                    this.rainbowMode.checked = !this.rainbowMode.checked;
                    this.rainbowMode.dispatchEvent(new Event('change'));
                    break;
                case 'arrowright': {
                    const name = this.visualizerEngine.cycleToNextPreset(1);
                    this.settings.set('preset', name);
                    break;
                }
                case 'arrowleft': {
                    const name = this.visualizerEngine.cycleToNextPreset(-1);
                    this.settings.set('preset', name);
                    break;
                }
                case 'escape':
                    this.shortcutsModal.classList.add('hidden');
                    break;
                default: {
                    const num = parseInt(e.key, 10);
                    if (!isNaN(num) && num >= 1 && num <= 9) {
                        const names = this.visualizerEngine.getPresetList();
                        if (names[num - 1]) {
                            this.visualizerEngine.setPreset(names[num - 1]);
                            this.settings.set('preset', names[num - 1]);
                        }
                    }
                }
            }
        });
    }

    bindDragAndDrop() {
        let dragCounter = 0;

        ['dragenter', 'dragover'].forEach(evt => {
            window.addEventListener(evt, (e) => {
                e.preventDefault();
                if (e.dataTransfer && [...e.dataTransfer.items].some(i => i.type.startsWith('audio/'))) {
                    dragCounter++;
                    this.dropzoneOverlay.classList.add('active');
                }
            });
        });

        ['dragleave', 'drop'].forEach(evt => {
            window.addEventListener(evt, (e) => {
                e.preventDefault();
                dragCounter = Math.max(0, dragCounter - 1);
                if (dragCounter === 0) this.dropzoneOverlay.classList.remove('active');
            });
        });

        window.addEventListener('drop', async (e) => {
            e.preventDefault();
            dragCounter = 0;
            this.dropzoneOverlay.classList.remove('active');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('audio/')) {
                this.dismissBoot();
                await this.handleFileLoad(file);
            } else if (file) {
                this.toast.error('Please drop a valid audio file.');
            }
        });
    }

    dismissBoot() {
        this.bootOverlay.classList.add('hidden');
    }

    async handleTabCapture() {
        const success = await this.audioManager.captureTabAudio();
        if (success) {
            this.playbackControls.style.display = 'none';
            this.toast.success('Tab audio connected');
        }
    }

    async handleMicCapture() {
        const success = await this.audioManager.captureMicAudio();
        if (success) {
            this.playbackControls.style.display = 'none';
            this.toast.success('Microphone connected');
        }
    }

    async handleFileLoad(file) {
        const success = await this.audioManager.loadLocalFile(file);
        if (success) {
            this.playbackControls.style.display = 'flex';
            this.btnPlayPause.textContent = '⏸';
            this.audioManager.setVolume(parseFloat(this.volumeSlider.value));
            this.toast.success(`Now playing: ${file.name}`);
        }
    }

    togglePlayback() {
        if (!this.audioManager.audioElement) return;
        const isPlaying = this.audioManager.togglePlayPause();
        this.btnPlayPause.textContent = isPlaying ? '⏸' : '▶';
    }

    takeScreenshot() {
        const ok = this.exporter.takeScreenshot();
        if (ok) this.toast.success('Screenshot saved 📸');
        else this.toast.error('Could not capture screenshot.');
    }

    toggleRecording() {
        if (!this.exporter.isSupported()) {
            this.toast.error('Recording is not supported in this browser.');
            return;
        }
        const nowRecording = this.exporter.toggleRecording();
        this.btnRecord.classList.toggle('recording', nowRecording);
        this.btnRecord.textContent = nowRecording ? '⏹ Stop' : '⏺ Record';
        this.toast.info(nowRecording ? 'Recording started…' : 'Recording saved 🎬');
    }

    onSourceChange(type) {
        if (type !== 'file') {
            this.playbackControls.style.display = 'none';
        }
    }

    updateStatus(message, tone = 'idle') {
        const colors = {
            ok: 'var(--ok-color)',
            warn: 'var(--warn-color)',
            err: 'var(--danger-color)',
            idle: 'var(--text-secondary)'
        };
        this.statusEl.textContent = message;
        this.statusEl.style.color = colors[tone] || colors.idle;
    }

    toggleUI(show) {
        if (show) {
            this.uiContainer.classList.remove('hidden');
            this.btnShowUI.style.display = 'none';
        } else {
            this.uiContainer.classList.add('hidden');
            this.btnShowUI.style.display = 'block';
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    formatTime(sec) {
        if (!isFinite(sec) || sec < 0) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    startWaveformLoop() {
        const draw = () => {
            requestAnimationFrame(draw);
            const audio = this.audioManager.getAudioData();
            const ctx = this.waveformCtx;
            const w = this.waveformCanvas.width;
            const h = this.waveformCanvas.height;

            ctx.clearRect(0, 0, w, h);
            ctx.beginPath();
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color') || '#00ffff';
            ctx.lineWidth = 2;

            const data = audio.timeDomain;
            const step = w / data.length;
            for (let i = 0; i < data.length; i++) {
                const x = i * step;
                const y = (data[i] / 255) * h;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Update playback scrubber if a file is loaded
            const info = this.audioManager.getPlaybackInfo();
            if (info && info.duration) {
                this.timeCurrent.textContent = this.formatTime(info.currentTime);
                this.timeDuration.textContent = this.formatTime(info.duration);
                if (document.activeElement !== this.seekSlider) {
                    this.seekSlider.value = Math.floor((info.currentTime / info.duration) * 1000);
                }
                this.btnPlayPause.textContent = info.paused ? '▶' : '⏸';
            }
        };
        draw();
    }

    startHudLoop() {
        setInterval(() => {
            const engine = this.visualizerEngine;
            this.hudFps.textContent = engine.fps || '--';

            const audio = engine.lastAudioData;
            if (audio) {
                this.hudBpm.textContent = audio.bpm > 0 ? audio.bpm : '--';
                const levelPct = Math.min(100, Math.round((audio.level || 0) * 140));
                this.hudLevelFill.style.width = `${levelPct}%`;
            }
        }, 200);
    }
}
