import * as THREE from 'three';

export class EnergyVortex {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.lines = [];
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 30, 50);
        this.engine.camera.lookAt(0, 0, 0);
        
        this.material = new THREE.LineBasicMaterial({
            color: this.engine.primaryColor,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const numLines = 50;
        const pointsPerLine = 100;
        
        for (let i = 0; i < numLines; i++) {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(pointsPerLine * 3);
            
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const line = new THREE.Line(geometry, this.material);
            this.lines.push({
                line: line,
                offset: (i / numLines) * Math.PI * 2
            });
            this.group.add(line);
        }
    }

    onColorChange(color) {
        if (this.material) this.material.color = color;
    }

    update(audio) {
        this.group.rotation.y += 0.01;
        
        const time = Date.now() * 0.001;
        const radius = 20 + (audio.bass * 10);
        const height = 40;
        
        this.lines.forEach((item, index) => {
            const positions = item.line.geometry.attributes.position.array;
            
            for (let i = 0; i < 100; i++) {
                const t = i / 100; // 0 to 1
                
                // Spiral shape
                const angle = item.offset + (t * Math.PI * 4) + (time * 2);
                
                // Vortex radius gets smaller at the bottom
                const currentRadius = radius * t;
                
                // Audio distortion
                const distortion = Math.sin(t * 20 + time * 5) * (audio.mid * 5) * (1 - t);
                
                positions[i*3] = Math.cos(angle) * (currentRadius + distortion);
                positions[i*3+1] = (t * height) - (height / 2);
                positions[i*3+2] = Math.sin(angle) * (currentRadius + distortion);
            }
            
            item.line.geometry.attributes.position.needsUpdate = true;
        });
        
        if (audio.isBeat) {
            this.material.opacity = 1;
        } else {
            this.material.opacity = Math.max(0.3, this.material.opacity - 0.02);
        }
    }

    cleanup() {
        this.scene.remove(this.group);
        this.lines.forEach(item => {
            item.line.geometry.dispose();
        });
        if (this.material) this.material.dispose();
    }
}
