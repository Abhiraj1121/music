import * as THREE from 'three';

export class FrequencyBars {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.bars = [];
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 30, 40);
        this.engine.camera.lookAt(0, 0, 0);

        this.material = new THREE.MeshBasicMaterial({
            color: this.engine.primaryColor,
            transparent: true,
            opacity: 0.8
        });

        const numBars = 64;
        const radius = 20;

        for (let i = 0; i < numBars; i++) {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            // Move anchor point to bottom
            geometry.translate(0, 0.5, 0);

            const bar = new THREE.Mesh(geometry, this.material);
            
            const angle = (i / numBars) * Math.PI * 2;
            bar.position.x = Math.cos(angle) * radius;
            bar.position.z = Math.sin(angle) * radius;
            
            bar.lookAt(0, 0, 0);
            
            this.bars.push({
                mesh: bar,
                index: i
            });
            this.group.add(bar);
        }
    }

    onColorChange(color) {
        if (this.material) this.material.color = color;
    }

    update(audio) {
        this.group.rotation.y += 0.002;

        const freqData = audio.frequencies;
        const numBars = this.bars.length;
        // Step size through frequency array
        const step = Math.floor(freqData.length / 2 / numBars); 

        this.bars.forEach((barObj, i) => {
            const freqVal = freqData[i * step] / 255.0; // 0 to 1
            const height = 1 + (freqVal * 20); // Scale height
            
            barObj.mesh.scale.y = height + (audio.bass * 2);
            
            if (audio.isBeat && i % 4 === 0) {
                barObj.mesh.scale.x = 2;
                barObj.mesh.scale.z = 2;
            } else {
                barObj.mesh.scale.x = Math.max(1, barObj.mesh.scale.x - 0.1);
                barObj.mesh.scale.z = Math.max(1, barObj.mesh.scale.z - 0.1);
            }
        });
    }

    cleanup() {
        this.scene.remove(this.group);
        if (this.bars.length > 0) {
            this.bars.forEach(b => b.mesh.geometry.dispose());
            if (this.material) this.material.dispose();
        }
    }
}
