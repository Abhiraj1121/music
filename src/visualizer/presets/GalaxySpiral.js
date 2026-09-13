import * as THREE from 'three';

// A spiral-armed particle galaxy, reminiscent of a real barred spiral galaxy,
// rotating and breathing with the music's energy.
export class GalaxySpiral {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.particles = null;
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 35, 45);
        this.engine.camera.lookAt(0, 0, 0);

        const particleCount = 8000;
        const arms = 4;
        const positions = new Float32Array(particleCount * 3);
        const baseRadii = new Float32Array(particleCount);
        const baseAngles = new Float32Array(particleCount);
        const armIndex = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const arm = i % arms;
            const t = Math.random();
            const radius = t * 40;
            const spin = radius * 0.25;
            const angle = (arm / arms) * Math.PI * 2 + spin;

            // Add scatter so arms aren't perfectly thin lines
            const scatter = (Math.random() - 0.5) * (2 + radius * 0.15);
            const heightScatter = (Math.random() - 0.5) * (2 * (1 - t));

            baseRadii[i] = radius;
            baseAngles[i] = angle;
            armIndex[i] = arm;

            positions[i * 3] = Math.cos(angle) * radius + scatter;
            positions[i * 3 + 1] = heightScatter;
            positions[i * 3 + 2] = Math.sin(angle) * radius + scatter;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.material = new THREE.PointsMaterial({
            size: 0.6,
            color: this.engine.primaryColor,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, this.material);
        this.group.add(this.particles);

        // Bright galactic core
        const coreGeo = new THREE.SphereGeometry(3, 16, 16);
        this.coreMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        this.core = new THREE.Mesh(coreGeo, this.coreMaterial);
        this.group.add(this.core);

        this.baseRadii = baseRadii;
        this.baseAngles = baseAngles;
        this.armIndex = armIndex;
        this.time = 0;
    }

    onColorChange(color) {
        if (this.material) this.material.color = color;
    }

    update(audio) {
        this.time += 0.01;
        this.group.rotation.y += 0.0015 + audio.mid * 0.003;

        const posAttr = this.particles.geometry.attributes.position;
        const pulse = 1 + audio.bass * 0.3;

        for (let i = 0; i < posAttr.count; i++) {
            const radius = this.baseRadii[i] * pulse;
            const angle = this.baseAngles[i] + this.time * (0.3 / (1 + this.baseRadii[i] * 0.05));

            posAttr.setX(i, Math.cos(angle) * radius);
            posAttr.setZ(i, Math.sin(angle) * radius);
        }
        posAttr.needsUpdate = true;

        const coreScale = 1 + audio.bass * 2 + audio.treble * 0.5;
        this.core.scale.setScalar(coreScale);

        if (audio.isBeat) {
            this.material.opacity = 1;
            this.coreMaterial.opacity = 1;
        } else {
            this.material.opacity = Math.max(0.5, this.material.opacity - 0.02);
            this.coreMaterial.opacity = Math.max(0.6, this.coreMaterial.opacity - 0.03);
        }
    }

    cleanup() {
        this.scene.remove(this.group);
        if (this.particles) {
            this.particles.geometry.dispose();
            this.particles.material.dispose();
        }
        if (this.core) {
            this.core.geometry.dispose();
            this.coreMaterial.dispose();
        }
    }
}
