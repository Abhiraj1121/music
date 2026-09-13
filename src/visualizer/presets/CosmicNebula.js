import * as THREE from 'three';

export class CosmicNebula {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.particles = null;
    }

    init() {
        this.scene.add(this.group);
        
        const geometry = new THREE.BufferGeometry();
        const particleCount = 5000;
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i*3] = (Math.random() - 0.5) * 200;
            positions[i*3+1] = (Math.random() - 0.5) * 200;
            positions[i*3+2] = (Math.random() - 0.5) * 200;
            sizes[i] = Math.random() * 2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        this.material = new THREE.PointsMaterial({
            size: 1.5,
            color: this.engine.primaryColor,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8,
            depthWrite: false
        });
        
        this.particles = new THREE.Points(geometry, this.material);
        this.group.add(this.particles);
        
        this.engine.camera.position.set(0, 0, 100);
        this.engine.camera.lookAt(0, 0, 0);
    }

    onColorChange(color) {
        if (this.material) {
            this.material.color = color;
        }
    }

    update(audio) {
        this.group.rotation.y += 0.001 + (audio.mid * 0.01);
        this.group.rotation.x += 0.0005 + (audio.bass * 0.005);
        
        const scale = 1 + (audio.bass * 0.5);
        this.particles.scale.set(scale, scale, scale);
        
        if (audio.isBeat) {
            this.material.opacity = 1;
        } else {
            this.material.opacity = Math.max(0.4, this.material.opacity - 0.05);
        }
    }

    cleanup() {
        this.scene.remove(this.group);
        if (this.particles) {
            this.particles.geometry.dispose();
            this.particles.material.dispose();
        }
    }
}
