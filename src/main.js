import { UIManager } from './ui/UIManager.js';
import { AudioManager } from './audio/AudioManager.js';
import { VisualizerEngine } from './visualizer/VisualizerEngine.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize components
        const audioManager = new AudioManager();
        const visualizerEngine = new VisualizerEngine(audioManager);
        const uiManager = new UIManager(audioManager, visualizerEngine);

        // Start rendering loop
        visualizerEngine.start();

        // Expose for quick debugging in the console
        window.__cognix = { audioManager, visualizerEngine, uiManager };
    } catch (err) {
        console.error('Fatal error starting Cognix Visualizer:', err);
        const boot = document.getElementById('boot-overlay');
        if (boot) {
            boot.innerHTML = `<div class="boot-card"><h1>Something went wrong</h1><p class="boot-sub">${err.message || 'Check the console for details.'}</p></div>`;
        }
    }
});
