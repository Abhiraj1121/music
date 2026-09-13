export class AudioAnalyzer {
    constructor() {
        this.analyser = null;
        this.dataArray = null;
        this.timeArray = null;

        // Smoothed values for visualizer
        this.smoothedBass = 0;
        this.smoothedMid = 0;
        this.smoothedTreble = 0;
        this.smoothedOverall = 0;
        this.beatThreshold = 1.5;
        this.isBeat = false;
        this.beatTimer = 0;

        // BPM estimation from beat intervals
        this.beatTimes = [];
        this.bpm = 0;
    }

    connect(context, sourceNode) {
        this.analyser = context.createAnalyser();
        this.analyser.fftSize = 2048; // Good resolution for frequencies
        this.analyser.smoothingTimeConstant = 0.8;

        sourceNode.connect(this.analyser);

        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        this.timeArray = new Uint8Array(bufferLength);

        // Reset beat tracking on new source
        this.beatTimes = [];
        this.bpm = 0;
    }

    getData() {
        if (!this.analyser) {
            return this.getEmptyData();
        }

        this.analyser.getByteFrequencyData(this.dataArray);
        this.analyser.getByteTimeDomainData(this.timeArray);

        // Analyze frequency bands
        let bassSum = 0, midSum = 0, trebleSum = 0, overallSum = 0;
        let peak = 0;
        const length = this.dataArray.length;

        // Define frequency bands (approximate indices)
        const bassEnd = Math.floor(length * 0.05);
        const midEnd = Math.floor(length * 0.4);

        for (let i = 0; i < length; i++) {
            const val = this.dataArray[i];
            overallSum += val;
            if (val > peak) peak = val;

            if (i < bassEnd) bassSum += val;
            else if (i < midEnd) midSum += val;
            else trebleSum += val;
        }

        // Time-domain peak (for level meter, catches transients FFT smoothing misses)
        let waveformPeak = 0;
        for (let i = 0; i < this.timeArray.length; i++) {
            const dev = Math.abs(this.timeArray[i] - 128);
            if (dev > waveformPeak) waveformPeak = dev;
        }

        // Normalize
        const maxBass = bassEnd * 255;
        const maxMid = (midEnd - bassEnd) * 255;
        const maxTreble = (length - midEnd) * 255;
        const maxOverall = length * 255;

        const currentBass = maxBass ? bassSum / maxBass : 0;
        const currentMid = maxMid ? midSum / maxMid : 0;
        const currentTreble = maxTreble ? trebleSum / maxTreble : 0;
        const currentOverall = maxOverall ? overallSum / maxOverall : 0;

        // Smooth values (simple low-pass filter)
        this.smoothedBass += (currentBass - this.smoothedBass) * 0.2;
        this.smoothedMid += (currentMid - this.smoothedMid) * 0.2;
        this.smoothedTreble += (currentTreble - this.smoothedTreble) * 0.2;
        this.smoothedOverall += (currentOverall - this.smoothedOverall) * 0.2;

        // Simple beat detection based on bass spike
        this.isBeat = false;
        if (currentBass > this.beatThreshold * this.smoothedBass && currentBass > 0.5) {
            if (this.beatTimer <= 0) {
                this.isBeat = true;
                this.beatTimer = 20; // Prevent multiple triggers per beat
                this.registerBeat();
            }
        }
        if (this.beatTimer > 0) this.beatTimer--;

        return {
            frequencies: this.dataArray,
            timeDomain: this.timeArray,
            bass: this.smoothedBass,
            mid: this.smoothedMid,
            treble: this.smoothedTreble,
            overall: this.smoothedOverall,
            level: waveformPeak / 128,
            peak: peak / 255,
            isBeat: this.isBeat,
            bpm: this.bpm
        };
    }

    registerBeat() {
        const now = performance.now();
        this.beatTimes.push(now);
        // Keep a rolling window of the last ~8 seconds of beats
        this.beatTimes = this.beatTimes.filter(t => now - t < 8000);

        if (this.beatTimes.length > 3) {
            const intervals = [];
            for (let i = 1; i < this.beatTimes.length; i++) {
                intervals.push(this.beatTimes[i] - this.beatTimes[i - 1]);
            }
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const bpm = 60000 / avgInterval;
            // Clamp to a sane music range
            if (bpm >= 40 && bpm <= 220) {
                this.bpm = Math.round(bpm);
            }
        }
    }

    getEmptyData() {
        return {
            frequencies: new Uint8Array(1024),
            timeDomain: new Uint8Array(1024),
            bass: 0, mid: 0, treble: 0, overall: 0, level: 0, peak: 0,
            isBeat: false, bpm: 0
        };
    }
}
