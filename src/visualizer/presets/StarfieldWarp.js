import * as THREE from 'three';

export class StarfieldWarp {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.count = 1500;
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 0, 5);
        this.engine.camera.lookAt(0, 0, -1);

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.count * 3);
        this.speeds = new Float32Array(this.count);

        for (let i = 0; i < this.count; i++) {
            this.resetStar(positions, i);
            this.speeds[i] = 0.5 + Math.random() * 1.5;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.material = new THREE.PointsMaterial({
            color: this.engine.primaryColor,
            size: 0.6,
            transparent: true,
            opacity: 0.9,
            sizeAttenuation: true
        });
        this.points = new THREE.Points(geometry, this.material);
        this.group.add(this.points);
    }

    resetStar(arr, i) {
        arr[i * 3] = (Math.random() - 0.5) * 60;
        arr[i * 3 + 1] = (Math.random() - 0.5) * 60;
        arr[i * 3 + 2] = -Math.random() * 200;
    }

    onColorChange(color) {
        if (this.material) this.material.color = color;
    }

    update(audio) {
        const pos = this.points.geometry.attributes.position.array;
        const speedBoost = 1 + audio.bass * 6 + audio.overall * 2;

        for (let i = 0; i < this.count; i++) {
            pos[i * 3 + 2] += this.speeds[i] * speedBoost;
            if (pos[i * 3 + 2] > 5) {
                this.resetStar(pos, i);
            }
        }
        this.points.geometry.attributes.position.needsUpdate = true;
        this.material.size = 0.5 + audio.treble * 1.5;

        this.group.rotation.z += 0.0008 + audio.mid * 0.002;
    }

    cleanup() {
        this.scene.remove(this.group);
        this.points.geometry.dispose();
        this.material.dispose();
    }
}
