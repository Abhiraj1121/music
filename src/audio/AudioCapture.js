export class AudioCapture {
    constructor(manager) {
        this.manager = manager;
    }

    async getTabStream() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            throw new Error('Your browser does not support tab capture (getDisplayMedia).');
        }

        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true, // Video is required to capture tab in many browsers
            audio: true
        });

        // Check if audio track exists
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) {
            stream.getTracks().forEach(track => track.stop());
            throw new Error('No audio track found. Re-share and check "Share tab audio".');
        }

        // We only need the audio, so we can stop the video track
        const videoTracks = stream.getVideoTracks();
        videoTracks.forEach(track => track.stop());

        return stream;
    }

    async getMicStream() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Your browser does not support microphone capture.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        });

        return stream;
    }
}
