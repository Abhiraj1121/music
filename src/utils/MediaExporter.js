// Handles snapshotting and recording the visualizer canvas output.
export class MediaExporter {
    constructor(canvas) {
        this.canvas = canvas;
        this.recorder = null;
        this.chunks = [];
        this.isRecording = false;
    }

    takeScreenshot() {
        try {
            const link = document.createElement('a');
            const stamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `cognix-visualizer-${stamp}.png`;
            link.href = this.canvas.toDataURL('image/png');
            link.click();
            return true;
        } catch (err) {
            console.error('Screenshot failed', err);
            return false;
        }
    }

    isSupported() {
        return typeof MediaRecorder !== 'undefined' && this.canvas.captureStream;
    }

    startRecording(fps = 30) {
        if (!this.isSupported() || this.isRecording) return false;

        const stream = this.canvas.captureStream(fps);
        const mimeCandidates = [
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm'
        ];
        const mimeType = mimeCandidates.find(t => MediaRecorder.isTypeSupported(t)) || '';

        this.recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        this.chunks = [];

        this.recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) this.chunks.push(e.data);
        };

        this.recorder.onstop = () => {
            const blob = new Blob(this.chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const stamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `cognix-visualizer-${stamp}.webm`;
            link.href = url;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 2000);
        };

        this.recorder.start();
        this.isRecording = true;
        return true;
    }

    stopRecording() {
        if (this.recorder && this.isRecording) {
            this.recorder.stop();
            this.isRecording = false;
            return true;
        }
        return false;
    }

    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
            return false;
        } else {
            return this.startRecording();
        }
    }
}
