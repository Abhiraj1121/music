import * as THREE from 'three';

export class FluidBars {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.bars = [];
        this.numBars = 128;
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 15, 60);
        this.engine.camera.lookAt(0, 0, 0);

        // We use a cylinder to look like a fluid drop/bar
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 16);
        geometry.translate(0, 0.5, 0); // Anchor at bottom

        this.material = new THREE.MeshPhongMaterial({
            color: this.engine.primaryColor,
            emissive: this.engine.primaryColor,
            emissiveIntensity: 0.4,
            shininess: 80,
            transparent: true,
            opacity: 0.9
        });

        // Add ambient light so it's never completely black
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.group.add(this.ambientLight);

        const totalWidth = 80;
        const startX = -totalWidth / 2;
        const spacing = totalWidth / this.numBars;

        for (let i = 0; i < this.numBars; i++) {
            const mesh = new THREE.Mesh(geometry, this.material);
            mesh.position.x = startX + i * spacing;
            mesh.position.y = -10;
            
            // Give them a slight curve backward
            mesh.position.z = Math.sin((i / this.numBars) * Math.PI) * 10 - 10;
            
            this.group.add(mesh);
            this.bars.push({
                mesh: mesh,
                targetHeight: 1,
                currentHeight: 1
            });
        }

        // Add some nice lighting for the fluid effect
        this.light1 = new THREE.PointLight(0xffffff, 1, 100);
        this.light1.position.set(20, 20, 20);
        this.group.add(this.light1);
        
        this.light2 = new THREE.PointLight(0x00ffff, 0.8, 100);
        this.light2.position.set(-20, 10, 10);
        this.group.add(this.light2);
    }

    onColorChange(color) {
        if (this.material) {
            this.material.color = color;
            this.material.emissive = color;
        }
        if (this.light2) this.light2.color = color;
    }

    update(audio) {
        const freqData = audio.frequencies;
        const step = Math.floor(freqData.length * 0.6 / this.numBars); // use lower 60% of frequencies

        for (let i = 0; i < this.numBars; i++) {
            const freqVal = freqData[i * step] / 255.0; 
            
            // Calculate a fluid target height
            const rawHeight = 1 + (freqVal * 30) + (audio.bass * 2);
            
            // Add a fluid wave motion
            const time = Date.now() * 0.002;
            const wave = Math.sin(i * 0.1 + time) * 2 * (1 + audio.mid);
            
            this.bars[i].targetHeight = Math.max(1, rawHeight + wave);
            
            // Smoothly interpolate (fluid motion)
            this.bars[i].currentHeight += (this.bars[i].targetHeight - this.bars[i].currentHeight) * 0.15;
            
            this.bars[i].mesh.scale.y = this.bars[i].currentHeight;
        }

        // Slow pan
        this.group.position.y = Math.sin(Date.now() * 0.001) * 2;
        
        // Dynamic lighting
        this.light1.intensity = 1 + audio.overall;
        this.light2.intensity = 0.8 + audio.bass;
    }

    cleanup() {
        this.scene.remove(this.group);
        if (this.bars.length > 0) {
            this.bars[0].mesh.geometry.dispose();
            this.material.dispose();
        }
    }
}
