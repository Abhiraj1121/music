import * as THREE from 'three';

export class PulsarStar {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.rings = [];
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 10, 40);
        this.engine.camera.lookAt(0, 0, 0);

        // Core star
        const coreGeo = new THREE.IcosahedronGeometry(4, 2);
        this.coreMat = new THREE.MeshBasicMaterial({
            color: this.engine.primaryColor,
            wireframe: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        this.core = new THREE.Mesh(coreGeo, this.coreMat);
        this.group.add(this.core);

        // Rings
        this.ringMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.2,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        for (let i = 1; i <= 5; i++) {
            const radius = i * 6;
            const pointsGeo = new THREE.BufferGeometry();
            const count = i * 100;
            const positions = new Float32Array(count * 3);

            for (let j = 0; j < count; j++) {
                const angle = (j / count) * Math.PI * 2;
                positions[j*3] = Math.cos(angle) * radius;
                positions[j*3+1] = (Math.random() - 0.5) * 2; // slight thickness
                positions[j*3+2] = Math.sin(angle) * radius;
            }

            pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const ring = new THREE.Points(pointsGeo, this.ringMat);
            
            // Tilt rings differently
            ring.rotation.x = Math.random() * Math.PI;
            ring.rotation.y = Math.random() * Math.PI;

            this.rings.push({
                mesh: ring,
                baseRadius: radius,
                speed: (Math.random() - 0.5) * 0.02
            });
            this.group.add(ring);
        }
    }

    onColorChange(color) {
        if (this.coreMat) this.coreMat.color = color;
        // Ring mat can optionally follow color or stay white
        if (this.ringMat) {
            const hsl = {};
            color.getHSL(hsl);
            this.ringMat.color.setHSL(hsl.h, hsl.s * 0.5, 0.8);
        }
    }

    update(audio) {
        this.group.rotation.y += 0.001;

        // Core reacts to bass heavily
        const coreScale = 1 + (audio.bass * 1.5);
        this.core.scale.set(coreScale, coreScale, coreScale);
        this.core.rotation.x += 0.01 + audio.mid * 0.05;
        this.core.rotation.y += 0.01 + audio.treble * 0.05;

        // Rings react to treble and mid
        this.rings.forEach((ringItem, i) => {
            ringItem.mesh.rotation.z += ringItem.speed + (audio.treble * 0.01);
            
            const ringScale = 1 + (audio.mid * 0.2 * (i+1)/5);
            ringItem.mesh.scale.set(ringScale, ringScale, ringScale);
        });

        if (audio.isBeat) {
            this.coreMat.opacity = 1.0;
        } else {
            this.coreMat.opacity = Math.max(0.5, this.coreMat.opacity - 0.05);
        }
    }

    cleanup() {
        this.scene.remove(this.group);
        if (this.core) this.core.geometry.dispose();
        if (this.coreMat) this.coreMat.dispose();
        this.rings.forEach(r => r.mesh.geometry.dispose());
        if (this.ringMat) this.ringMat.dispose();
    }
}
