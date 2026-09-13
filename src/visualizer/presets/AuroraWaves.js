import * as THREE from 'three';

// Layered ribbon planes with vertex-displaced sine waves, resembling
// flowing aurora curtains that shimmer and ripple with the audio.
export class AuroraWaves {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.ribbons = [];
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 8, 45);
        this.engine.camera.lookAt(0, 0, 0);

        const ribbonCount = 4;
        const width = 70;
        const depth = 14;
        const segmentsX = 60;
        const segmentsY = 12;

        for (let i = 0; i < ribbonCount; i++) {
            const geometry = new THREE.PlaneGeometry(width, depth, segmentsX, segmentsY);
            geometry.rotateX(-Math.PI / 2.4);

            const hueOffset = i / ribbonCount;
            const material = new THREE.MeshBasicMaterial({
                color: this.engine.primaryColor,
                wireframe: true,
                transparent: true,
                opacity: 0.35 - i * 0.05,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = -6 + i * 5;
            mesh.position.z = -i * 6;

            this.ribbons.push({
                mesh,
                material,
                basePositions: Float32Array.from(geometry.attributes.position.array),
                hueOffset,
                phase: i * 1.3
            });
            this.group.add(mesh);
        }

        this.time = 0;
    }

    onColorChange(color) {
        this.ribbons.forEach((ribbon, i) => {
            if (i === 0) {
                ribbon.material.color = color;
            } else {
                // Subsequent ribbons get a hue-shifted variant for depth
                const hsl = {};
                color.getHSL(hsl);
                const shifted = new THREE.Color();
                shifted.setHSL((hsl.h + ribbon.hueOffset * 0.3) % 1, hsl.s, hsl.l);
                ribbon.material.color = shifted;
            }
        });
    }

    update(audio) {
        this.time += 0.02;
        this.group.rotation.y = Math.sin(this.time * 0.1) * 0.15;

        this.ribbons.forEach((ribbon) => {
            const posAttr = ribbon.mesh.geometry.attributes.position;
            const base = ribbon.basePositions;

            for (let i = 0; i < posAttr.count; i++) {
                const bx = base[i * 3];
                const bz = base[i * 3 + 2];

                const wave1 = Math.sin(bx * 0.15 + this.time * 2 + ribbon.phase) * (1.5 + audio.bass * 4);
                const wave2 = Math.cos(bz * 0.3 + this.time * 1.5) * (0.8 + audio.mid * 2);

                posAttr.setY(i, wave1 + wave2);
            }
            posAttr.needsUpdate = true;

            ribbon.material.opacity = Math.min(0.6, 0.2 + audio.overall * 0.5);
        });

        if (audio.isBeat) {
            this.ribbons.forEach(r => { r.material.opacity = Math.min(0.8, r.material.opacity + 0.3); });
        }
    }

    cleanup() {
        this.scene.remove(this.group);
        this.ribbons.forEach(r => {
            r.mesh.geometry.dispose();
            r.material.dispose();
        });
    }
}
