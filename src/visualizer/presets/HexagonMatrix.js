import * as THREE from 'three';

// A tribute to the Cognix Studio hexagonal brand mark: a field of hexagonal
// prisms arranged in a honeycomb grid that light up and rise with the beat.
export class HexagonMatrix {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.cells = [];
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 26, 38);
        this.engine.camera.lookAt(0, 0, 0);

        this.material = new THREE.MeshBasicMaterial({
            color: this.engine.primaryColor,
            wireframe: true,
            transparent: true,
            opacity: 0.85
        });

        const hexRadius = 2.6;
        const hexHeight = 1.2;
        const geometry = new THREE.CylinderGeometry(hexRadius, hexRadius, hexHeight, 6);

        const cols = 9;
        const rows = 7;
        const xSpacing = hexRadius * Math.sqrt(3);
        const zSpacing = hexRadius * 1.5;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const mesh = new THREE.Mesh(geometry, this.material);
                const offsetX = (row % 2) * (xSpacing / 2);
                mesh.position.x = (col * xSpacing) + offsetX - (cols * xSpacing) / 2;
                mesh.position.z = (row * zSpacing) - (rows * zSpacing) / 2;
                mesh.position.y = 0;

                const distFromCenter = Math.sqrt(mesh.position.x ** 2 + mesh.position.z ** 2);

                this.cells.push({
                    mesh,
                    baseY: 0,
                    dist: distFromCenter,
                    phase: Math.random() * Math.PI * 2
                });
                this.group.add(mesh);
            }
        }

        this.time = 0;
    }

    onColorChange(color) {
        if (this.material) this.material.color = color;
    }

    update(audio) {
        this.time += 0.02;
        this.group.rotation.y += 0.0015 + audio.mid * 0.004;

        const maxDist = Math.max(...this.cells.map(c => c.dist));

        this.cells.forEach((cell) => {
            // Ripple outward from the center, driven by bass + a traveling wave
            const wave = Math.sin(this.time * 2 - (cell.dist / maxDist) * 6) * 0.5 + 0.5;
            const bassLift = audio.bass * 8 * wave;
            const idleBob = Math.sin(this.time + cell.phase) * 0.3;

            cell.mesh.position.y = cell.baseY + bassLift + idleBob;
            cell.mesh.rotation.y += 0.01 + audio.treble * 0.02;

            const scale = 1 + wave * audio.mid * 0.6;
            cell.mesh.scale.y = Math.max(0.3, scale);
        });

        if (audio.isBeat) {
            this.material.opacity = 1;
        } else {
            this.material.opacity = Math.max(0.5, this.material.opacity - 0.04);
        }
    }

    cleanup() {
        this.scene.remove(this.group);
        if (this.cells.length > 0) {
            this.cells[0].mesh.geometry.dispose();
            if (this.material) this.material.dispose();
        }
    }
}
