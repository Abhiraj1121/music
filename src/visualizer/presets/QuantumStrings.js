import * as THREE from 'three';

export class QuantumStrings {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.lines = [];
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 0, 40);
        this.engine.camera.lookAt(0, 0, 0);

        this.material = new THREE.LineBasicMaterial({
            color: this.engine.primaryColor,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });

        const numStrings = 20;
        const pointsPerString = 100;

        for (let i = 0; i < numStrings; i++) {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(pointsPerString * 3);
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const line = new THREE.Line(geometry, this.material);
            // Spread them horizontally
            line.position.y = (i - numStrings/2) * 1.5;
            
            this.lines.push({
                line: line,
                index: i
            });
            this.group.add(line);
        }
    }

    onColorChange(color) {
        if (this.material) this.material.color = color;
    }

    update(audio) {
        const time = Date.now() * 0.002;
        const timeData = audio.timeDomain; // Array of 0-255

        this.lines.forEach((item) => {
            const positions = item.line.geometry.attributes.position.array;
            const pointsCount = positions.length / 3;
            const step = Math.floor(timeData.length / pointsCount);

            for (let i = 0; i < pointsCount; i++) {
                // X goes from -30 to 30
                positions[i*3] = (i / pointsCount) * 60 - 30;
                
                // Base wave + time domain data
                const wave = Math.sin((i * 0.1) + time + item.index) * 2;
                
                // Map time domain (128 is center)
                const val = (timeData[i * step] - 128) / 128.0; 
                const react = val * (10 + audio.bass * 20);
                
                positions[i*3+1] = wave + react;
                positions[i*3+2] = Math.cos((i * 0.1) + time) * 5;
            }
            item.line.geometry.attributes.position.needsUpdate = true;
        });

        // Rotate slightly on mid
        this.group.rotation.x = Math.sin(time * 0.5) * (audio.mid * 0.2);
    }

    cleanup() {
        this.scene.remove(this.group);
        this.lines.forEach(item => item.line.geometry.dispose());
        if (this.material) this.material.dispose();
    }
}
