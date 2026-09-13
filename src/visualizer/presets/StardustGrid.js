import * as THREE from 'three';

export class StardustGrid {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.gridSize = 40;
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 15, 30);
        this.engine.camera.lookAt(0, 0, 0);

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.gridSize * this.gridSize * 3);
        
        let idx = 0;
        const spacing = 1.5;
        const offset = (this.gridSize * spacing) / 2;

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                positions[idx++] = i * spacing - offset;
                positions[idx++] = 0;
                positions[idx++] = j * spacing - offset;
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.originalPositions = new Float32Array(positions);

        this.material = new THREE.PointsMaterial({
            color: this.engine.primaryColor,
            size: 0.5,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.points = new THREE.Points(geometry, this.material);
        this.group.add(this.points);
    }

    onColorChange(color) {
        if (this.material) this.material.color = color;
    }

    update(audio) {
        const time = Date.now() * 0.002;
        const positions = this.points.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = this.originalPositions[i];
            const z = this.originalPositions[i+2];
            
            // Create a wavy terrain based on distance from center
            const dist = Math.sqrt(x*x + z*z);
            const wave = Math.sin(dist * 0.5 - time) * (2 + audio.bass * 5);
            const ripple = Math.cos(x * 0.5 + time) * Math.sin(z * 0.5 + time) * (audio.mid * 5);
            
            positions[i+1] = wave + ripple;
        }

        this.points.geometry.attributes.position.needsUpdate = true;
        this.group.rotation.y = Math.sin(time * 0.1) * 0.2;
    }

    cleanup() {
        this.scene.remove(this.group);
        if (this.points) this.points.geometry.dispose();
        if (this.material) this.material.dispose();
    }
}
