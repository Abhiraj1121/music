import { AudioCapture } from './AudioCapture.js';
import { AudioAnalyzer } from './AudioAnalyzer.js';

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.audioElement = null;
        this.mediaStream = null;
        this.sourceNode = null;
        this.gainNode = null;

        this.sourceType = null; // 'tab' | 'mic' | 'file'
        this.currentFileName = null;

        this.capture = new AudioCapture(this);
        this.analyzer = new AudioAnalyzer();

        this.onStatusChange = () => {};
        this.onSourceChange = () => {};
        this.onError = () => {};
    }

    async initContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    async captureTabAudio() {
        try {
            await this.initContext();
            this.onStatusChange('Requesting tab capture…', 'warn');

            const stream = await this.capture.getTabStream();

            this.cleanup();
            this.mediaStream = stream;

            this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.setupAnalyzer();

            this.sourceType = 'tab';
            this.onStatusChange('Tab audio connected', 'ok');
            this.onSourceChange('tab');

            stream.getTracks()[0].onended = () => {
                this.onStatusChange('Stream ended', 'err');
                this.cleanup();
                this.onSourceChange(null);
            };

            return true;
        } catch (err) {
            console.error(err);
            this.onStatusChange('Tab capture cancelled/failed', 'err');
            this.onError(err.message || 'Could not capture tab audio.');
            return false;
        }
    }

    async captureMicAudio() {
        try {
            await this.initContext();
            this.onStatusChange('Requesting microphone…', 'warn');

            const stream = await this.capture.getMicStream();

            this.cleanup();
            this.mediaStream = stream;

            this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.setupAnalyzer();

            this.sourceType = 'mic';
            this.onStatusChange('Microphone connected', 'ok');
            this.onSourceChange('mic');

            stream.getTracks()[0].onended = () => {
                this.onStatusChange('Microphone disconnected', 'err');
                this.cleanup();
                this.onSourceChange(null);
            };

            return true;
        } catch (err) {
            console.error(err);
            this.onStatusChange('Microphone access denied', 'err');
            this.onError(err.message || 'Could not access the microphone.');
            return false;
        }
    }

    async loadLocalFile(file) {
        try {
            await this.initContext();
            this.onStatusChange('Loading file…', 'warn');

            this.cleanup();

            const url = URL.createObjectURL(file);
            this.audioElement = new Audio(url);
            this.audioElement.crossOrigin = "anonymous";

            this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
            this.gainNode = this.audioContext.createGain();

            this.sourceNode.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);

            this.setupAnalyzer(this.gainNode);

            await this.audioElement.play();
            this.sourceType = 'file';
            this.currentFileName = file.name;
            this.onStatusChange(`Playing: ${file.name}`, 'ok');
            this.onSourceChange('file');

            this.audioElement.onended = () => {
                this.onStatusChange('Playback finished', 'idle');
            };

            return true;
        } catch (err) {
            console.error(err);
            this.onStatusChange('Error loading file', 'err');
            this.onError('Could not load or play that audio file.');
            return false;
        }
    }

    setupAnalyzer(source = this.sourceNode) {
        this.analyzer.connect(this.audioContext, source);
    }

    togglePlayPause() {
        if (!this.audioElement) return false;

        if (this.audioElement.paused) {
            this.audioElement.play();
            this.audioContext.resume();
            return true;
        } else {
            this.audioElement.pause();
            return false;
        }
    }

    seek(fraction) {
        if (!this.audioElement || !isFinite(this.audioElement.duration)) return;
        this.audioElement.currentTime = fraction * this.audioElement.duration;
    }

    getPlaybackInfo() {
        if (!this.audioElement) return null;
        return {
            currentTime: this.audioElement.currentTime || 0,
            duration: this.audioElement.duration || 0,
            paused: this.audioElement.paused
        };
    }

    setVolume(value) {
        if (this.gainNode) {
            this.gainNode.gain.value = value;
        } else if (this.audioElement) {
            this.audioElement.volume = value;
        }
    }

    getAudioData() {
        return this.analyzer.getData();
    }

    hasActiveSource() {
        return !!(this.sourceType);
    }

    cleanup() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.src = "";
            this.audioElement = null;
        }
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        if (this.sourceNode) {
            this.sourceNode.disconnect();
            this.sourceNode = null;
        }
        if (this.gainNode) {
            this.gainNode.disconnect();
            this.gainNode = null;
        }
        this.sourceType = null;
        this.currentFileName = null;
    }
}
