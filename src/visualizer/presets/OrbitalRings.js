import * as THREE from 'three';

export class OrbitalRings {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.rings = [];
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 6, 46);
        this.engine.camera.lookAt(0, 0, 0);

        this.material = new THREE.MeshBasicMaterial({
            color: this.engine.primaryColor,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });

        const count = 12;
        for (let i = 0; i < count; i++) {
            const radius = 4 + i * 2.2;
            const geometry = new THREE.TorusGeometry(radius, 0.15, 8, 64);
            const mesh = new THREE.Mesh(geometry, this.material.clone());
            mesh.rotation.x = Math.PI / 2 + (i % 2 === 0 ? 0.15 : -0.15);
            mesh.rotation.y = i * 0.1;
            this.rings.push({ mesh, radius, baseTube: 0.15, tilt: (i % 2 === 0 ? 1 : -1) });
            this.group.add(mesh);
        }
    }

    onColorChange(color) {
        this.rings.forEach(r => { r.mesh.material.color = color; });
    }

    update(audio) {
        const freq = audio.frequencies;
        const n = this.rings.length;

        this.rings.forEach((r, i) => {
            const idx = Math.floor((i / n) * (freq.length / 2));
            const val = freq[idx] / 255;
            const scale = 1 + val * 0.5 + audio.bass * 0.3;
            r.mesh.scale.set(scale, scale, 1);
            r.mesh.rotation.z += 0.002 * r.tilt * (1 + val * 3);
            r.mesh.material.opacity = 0.35 + val * 0.6;
        });

        this.group.rotation.y += 0.0018 + audio.treble * 0.003;
        this.group.rotation.x = Math.sin(performance.now() * 0.0003) * 0.15;
    }

    cleanup() {
        this.scene.remove(this.group);
        this.rings.forEach(r => { r.mesh.geometry.dispose(); r.mesh.material.dispose(); });
        this.material.dispose();
    }
}
