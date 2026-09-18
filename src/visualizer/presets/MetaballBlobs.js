import * as THREE from 'three';

export class MetaballBlobs {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.blobs = [];
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 0, 42);
        this.engine.camera.lookAt(0, 0, 0);

        this.material = new THREE.MeshStandardMaterial({
            color: this.engine.primaryColor,
            emissive: this.engine.primaryColor,
            emissiveIntensity: 0.5,
            roughness: 0.25,
            metalness: 0.4
        });

        this.light = new THREE.PointLight(0xffffff, 1.2, 100);
        this.light.position.set(0, 10, 30);
        this.group.add(this.light);

        const count = 9;
        for (let i = 0; i < count; i++) {
            const radius = 2 + Math.random() * 1.5;
            const geometry = new THREE.IcosahedronGeometry(radius, 3);
            const mesh = new THREE.Mesh(geometry, this.material);
            const orbitR = 6 + Math.random() * 10;
            this.blobs.push({
                mesh,
                base: geometry.attributes.position.array.slice(),
                orbitR,
                angle: Math.random() * Math.PI * 2,
                speed: 0.1 + Math.random() * 0.3,
                phase: Math.random() * 10
            });
            this.group.add(mesh);
        }
    }

    onColorChange(color) {
        if (this.material) {
            this.material.color = color;
            this.material.emissive = color;
        }
    }

    update(audio) {
        const t = performance.now() * 0.001;
        this.blobs.forEach(b => {
            b.angle += b.speed * 0.01 * (1 + audio.mid * 2);
            b.mesh.position.x = Math.cos(b.angle) * b.orbitR;
            b.mesh.position.z = Math.sin(b.angle) * b.orbitR;
            b.mesh.position.y = Math.sin(t + b.phase) * 3 * (1 + audio.bass);

            const pos = b.mesh.geometry.attributes.position;
            const base = b.base;
            for (let i = 0; i < pos.count; i++) {
                const ix = i * 3;
                const noise = Math.sin(base[ix] * 2 + t * 2 + b.phase) * audio.treble * 0.6;
                const scale = 1 + audio.bass * 0.4 + noise;
                pos.array[ix] = base[ix] * scale;
                pos.array[ix + 1] = base[ix + 1] * scale;
                pos.array[ix + 2] = base[ix + 2] * scale;
            }
            pos.needsUpdate = true;
            b.mesh.geometry.computeVertexNormals();
        });

        this.group.rotation.y += 0.0025;
    }

    cleanup() {
        this.scene.remove(this.group);
        this.blobs.forEach(b => b.mesh.geometry.dispose());
        this.material.dispose();
    }
}
