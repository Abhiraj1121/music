import { CosmicNebula } from './presets/CosmicNebula.js';
import { NeonTunnel } from './presets/NeonTunnel.js';
import { LiquidGeometry } from './presets/LiquidGeometry.js';
import { Kaleidoscope } from './presets/Kaleidoscope.js';
import { EnergyVortex } from './presets/EnergyVortex.js';
import { AudioCube } from './presets/AudioCube.js';
import { FrequencyBars } from './presets/FrequencyBars.js';
import { StardustGrid } from './presets/StardustGrid.js';
import { QuantumStrings } from './presets/QuantumStrings.js';
import { PulsarStar } from './presets/PulsarStar.js';
import { FluidBars } from './presets/FluidBars.js';
import { HexagonMatrix } from './presets/HexagonMatrix.js';
import { DNAHelix } from './presets/DNAHelix.js';
import { CrystalShatter } from './presets/CrystalShatter.js';
import { AuroraWaves } from './presets/AuroraWaves.js';
import { GalaxySpiral } from './presets/GalaxySpiral.js';

export const PRESET_META = {
    'CosmicNebula':   { label: 'Cosmic Nebula',   icon: '🌌' },
    'NeonTunnel':     { label: 'Neon Tunnel',     icon: '🌀' },
    'LiquidGeometry': { label: 'Liquid Geometry', icon: '💧' },
    'Kaleidoscope':   { label: 'Kaleidoscope',    icon: '🔮' },
    'EnergyVortex':   { label: 'Energy Vortex',   icon: '🌪️' },
    'AudioCube':      { label: 'Audio Cube',      icon: '🧊' },
    'FrequencyBars':  { label: 'Frequency Bars',  icon: '📊' },
    'StardustGrid':   { label: 'Stardust Grid',   icon: '✨' },
    'QuantumStrings': { label: 'Quantum Strings', icon: '🎻' },
    'PulsarStar':     { label: 'Pulsar Star',     icon: '⭐' },
    'FluidBars':      { label: 'Fluid Bars',      icon: '🌊' },
    'HexagonMatrix':  { label: 'Hexagon Matrix',  icon: '⬡' },
    'DNAHelix':       { label: 'DNA Helix',       icon: '🧬' },
    'CrystalShatter': { label: 'Crystal Shatter', icon: '💎' },
    'AuroraWaves':    { label: 'Aurora Waves',    icon: '🌠' },
    'GalaxySpiral':   { label: 'Galaxy Spiral',   icon: '🌀' }
};

export class PresetManager {
    constructor(engine) {
        this.engine = engine;
        this.presets = {
            'CosmicNebula': CosmicNebula,
            'NeonTunnel': NeonTunnel,
            'LiquidGeometry': LiquidGeometry,
            'Kaleidoscope': Kaleidoscope,
            'EnergyVortex': EnergyVortex,
            'AudioCube': AudioCube,
            'FrequencyBars': FrequencyBars,
            'StardustGrid': StardustGrid,
            'QuantumStrings': QuantumStrings,
            'PulsarStar': PulsarStar,
            'FluidBars': FluidBars,
            'HexagonMatrix': HexagonMatrix,
            'DNAHelix': DNAHelix,
            'CrystalShatter': CrystalShatter,
            'AuroraWaves': AuroraWaves,
            'GalaxySpiral': GalaxySpiral
        };

        this.currentPreset = null;
        this.currentPresetName = null;

        this.onPresetChange = () => {};

        // Sensible fallback so the engine always has something rendering,
        // even if no UI layer calls setPreset() explicitly.
        this.switchPreset('CosmicNebula');
    }

    switchPreset(presetName) {
        if (!this.presets[presetName]) return;

        if (this.currentPreset) {
            this.currentPreset.cleanup();
        }

        const PresetClass = this.presets[presetName];
        if (PresetClass) {
            this.currentPreset = new PresetClass(this.engine);
            this.currentPreset.init();
            this.currentPresetName = presetName;
            if (this.currentPreset.onColorChange) {
                this.currentPreset.onColorChange(this.engine.primaryColor);
            }
            this.onPresetChange(presetName);
        }
    }
}
