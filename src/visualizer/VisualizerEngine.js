import * as THREE from 'three';
import { PresetManager } from './PresetManager.js';

export class VisualizerEngine {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.canvas = document.getElementById('visualizer-canvas');

        // Settings
        this.sensitivity = 1.0;
        this.primaryColor = new THREE.Color('#00ffff');
        this.rainbowMode = false;

        // Auto-cycle presets
        this.autoCycle = false;
        this.autoCycleInterval = 20; // seconds
        this._autoCycleElapsed = 0;

        // HUD stats
        this.fps = 0;
        this._frameCount = 0;
        this._fpsLastTime = performance.now();
        this._lastFrameTime = performance.now();

        this.onPresetAutoSwitch = () => {};

        this.initThreeJS();

        this.presetManager = new PresetManager(this);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    initThreeJS() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.002);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 50;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true // needed for screenshot/recording capture
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    getPresetList() {
        return Object.keys(this.presetManager.presets);
    }

    setPreset(presetName) {
        this.presetManager.switchPreset(presetName);
        this._autoCycleElapsed = 0;
    }

    cycleToNextPreset(direction = 1) {
        const names = this.getPresetList();
        const currentIndex = names.indexOf(this.presetManager.currentPresetName);
        const nextIndex = (currentIndex + direction + names.length) % names.length;
        this.setPreset(names[nextIndex]);
        return names[nextIndex];
    }

    setSensitivity(val) {
        this.sensitivity = val;
    }

    setPrimaryColor(hex) {
        this.primaryColor.set(hex);
        if (this.presetManager.currentPreset && this.presetManager.currentPreset.onColorChange) {
            this.presetManager.currentPreset.onColorChange(this.primaryColor);
        }
    }

    setRainbowMode(val) {
        this.rainbowMode = val;
    }

    setAutoCycle(enabled, intervalSeconds = 20) {
        this.autoCycle = enabled;
        this.autoCycleInterval = intervalSeconds;
        this._autoCycleElapsed = 0;
    }

    start() {
        this.renderer.setAnimationLoop((time) => this.animate(time));
    }

    animate(time) {
        const now = (typeof time === 'number') ? time : performance.now();
        const delta = (now - this._lastFrameTime) / 1000;
        this._lastFrameTime = now;

        // FPS counter (updates once per second)
        this._frameCount++;
        if (now - this._fpsLastTime >= 1000) {
            this.fps = this._frameCount;
            this._frameCount = 0;
            this._fpsLastTime = now;
        }

        // Auto-cycle presets
        if (this.autoCycle) {
            this._autoCycleElapsed += delta;
            if (this._autoCycleElapsed >= this.autoCycleInterval) {
                const newName = this.cycleToNextPreset(1);
                this.onPresetAutoSwitch(newName);
            }
        }

        if (this.rainbowMode) {
            // Cycle through hues over time
            const t = Date.now() * 0.0005;
            this.primaryColor.setHSL(t % 1.0, 1.0, 0.5);
            if (this.presetManager.currentPreset && this.presetManager.currentPreset.onColorChange) {
                this.presetManager.currentPreset.onColorChange(this.primaryColor);
            }
        }

        const audioData = this.audioManager.getAudioData();

        // Apply sensitivity
        audioData.bass *= this.sensitivity;
        audioData.mid *= this.sensitivity;
        audioData.treble *= this.sensitivity;
        audioData.overall *= this.sensitivity;

        this.lastAudioData = audioData;

        if (this.presetManager.currentPreset) {
            this.presetManager.currentPreset.update(audioData);
        }

        this.renderer.render(this.scene, this.camera);
    }
}
