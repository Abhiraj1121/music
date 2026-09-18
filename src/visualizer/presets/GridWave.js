import * as THREE from 'three';

export class GridWave {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 14, 30);
        this.engine.camera.lookAt(0, 0, 0);

        this.cols = 48;
        this.rows = 48;
        const geometry = new THREE.PlaneGeometry(50, 50, this.cols - 1, this.rows - 1);
        geometry.rotateX(-Math.PI / 2);
        this.base = geometry.attributes.position.array.slice();

        this.material = new THREE.MeshBasicMaterial({
            color: this.engine.primaryColor,
            wireframe: true,
            transparent: true,
            opacity: 0.75
        });
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.group.add(this.mesh);
        this.t = 0;
    }

    onColorChange(color) {
        if (this.material) this.material.color = color;
    }

    update(audio) {
        this.t += 0.02 + audio.mid * 0.05;
        const pos = this.mesh.geometry.attributes.position;
        const base = this.base;
        const amp = 2 + audio.bass * 10;

        for (let i = 0; i < pos.count; i++) {
            const ix = i * 3;
            const x = base[ix];
            const z = base[ix + 2];
            const dist = Math.sqrt(x * x + z * z);
            const wave = Math.sin(dist * 0.3 - this.t * 2) * amp * (1 - Math.min(dist / 35, 1));
            pos.array[ix + 1] = wave + Math.sin(x * 0.2 + this.t) * audio.treble * 3;
        }
        pos.needsUpdate = true;
        this.mesh.geometry.computeVertexNormals();

        this.group.rotation.y += 0.0012;
    }

    cleanup() {
        this.scene.remove(this.group);
        this.mesh.geometry.dispose();
        this.material.dispose();
    }
}
