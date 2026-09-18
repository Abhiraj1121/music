// Persists user preferences (preset, color, sensitivity, etc) across sessions.
const STORAGE_KEY = 'cognix-visualizer-settings-v1';

const DEFAULTS = {
    preset: 'CosmicNebula',
    sensitivity: 1.0,
    primaryColor: '#00ffff',
    rainbowMode: false,
    volume: 0.8,
    autoCycle: false,
    autoCycleInterval: 20,
    showHud: true,
    profileName: '',
    profileColor: '#00ffff',
    hideConnectBox: false
};

export class SettingsStore {
    constructor() {
        this.data = { ...DEFAULTS, ...this.load() };
    }

    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (err) {
            console.warn('Could not load saved settings', err);
            return {};
        }
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (err) {
            console.warn('Could not persist settings', err);
        }
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        this.data[key] = value;
        this.save();
    }

    getAll() {
        return { ...this.data };
    }

    reset() {
        const { profileName, profileColor } = this.data;
        this.data = { ...DEFAULTS, profileName, profileColor };
        this.save();
    }
}
