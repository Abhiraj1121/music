import * as THREE from 'three';

export class SpectrumRibbon {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.segments = 96;
        this.history = [];
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 8, 34);
        this.engine.camera.lookAt(0, 0, 0);

        this.rows = 24;
        for (let i = 0; i < this.rows; i++) this.history.push(new Float32Array(this.segments));

        const geometry = new THREE.PlaneGeometry(46, 22, this.segments - 1, this.rows - 1);
        this.material = new THREE.MeshBasicMaterial({
            color: this.engine.primaryColor,
            wireframe: true,
            transparent: true,
            opacity: 0.85
        });
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.rotation.x = -Math.PI / 2.6;
        this.group.add(this.mesh);
        this.basePositions = geometry.attributes.position.array.slice();
    }

    onColorChange(color) {
        if (this.material) this.material.color = color;
    }

    update(audio) {
        const freq = audio.frequencies;
        const row = new Float32Array(this.segments);
        for (let i = 0; i < this.segments; i++) {
            const idx = Math.floor((i / this.segments) * (freq.length / 2));
            row[i] = (freq[idx] / 255) * (8 + audio.bass * 10);
        }
        this.history.unshift(row);
        this.history.pop();

        const pos = this.mesh.geometry.attributes.position;
        const base = this.basePositions;
        for (let r = 0; r < this.rows; r++) {
            const rowData = this.history[r];
            for (let c = 0; c < this.segments; c++) {
                const i = (r * this.segments + c) * 3;
                pos.array[i + 1] = base[i + 1] + rowData[c];
            }
        }
        pos.needsUpdate = true;

        this.group.rotation.y += 0.0015 + audio.treble * 0.004;
        const s = 1 + audio.bass * 0.08;
        this.group.scale.set(s, s, s);
    }

    cleanup() {
        this.scene.remove(this.group);
        this.mesh.geometry.dispose();
        this.material.dispose();
    }
}
