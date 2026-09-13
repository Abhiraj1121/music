import * as THREE from 'three';

export class LiquidGeometry {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 0, 30);
        this.engine.camera.lookAt(0, 0, 0);
        
        // Use SphereGeometry because it has continuous UVs/Vertices avoiding the tearing glitch
        this.geometry = new THREE.SphereGeometry(10, 64, 64);
        
        // Store original positions for safe continuous deformation
        this.originalPositions = new Float32Array(this.geometry.attributes.position.array);
        
        this.material = new THREE.MeshStandardMaterial({
            color: this.engine.primaryColor,
            wireframe: true,
            roughness: 0.2,
            metalness: 0.8
        });
        
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.group.add(this.mesh);
        
        // Add lights just for this preset
        this.light1 = new THREE.PointLight(0xffffff, 1, 100);
        this.light1.position.set(20, 20, 20);
        this.group.add(this.light1);
        
        this.light2 = new THREE.PointLight(0xff00ff, 1, 100);
        this.light2.position.set(-20, -20, 20);
        this.group.add(this.light2);
    }

    onColorChange(color) {
        if (this.material) this.material.color = color;
    }

    update(audio) {
        this.group.rotation.y += 0.002;
        this.group.rotation.x += 0.001;
        
        const positions = this.geometry.attributes.position.array;
        const time = Date.now() * 0.001;
        
        // Deform vertices smoothly
        for (let i = 0; i < positions.length; i += 3) {
            const ox = this.originalPositions[i];
            const oy = this.originalPositions[i+1];
            const oz = this.originalPositions[i+2];
            
            // Generate a smooth wave pattern based on original position and time
            const wave = Math.sin(ox * 0.2 + time * 2) + Math.cos(oy * 0.2 + time * 1.5) + Math.sin(oz * 0.2 + time);
            
            // Audio reactiveness
            const displacement = (audio.bass * 3.0) * wave + (audio.mid * 1.0) * Math.sin(oy * 0.5);
            
            // Since it's a sphere of radius 10, the original length is roughly 10.
            // We just scale the vector outward.
            const len = Math.sqrt(ox*ox + oy*oy + oz*oz);
            if (len > 0) {
                const nx = ox / len;
                const ny = oy / len;
                const nz = oz / len;
                
                positions[i]   = ox + nx * displacement;
                positions[i+1] = oy + ny * displacement;
                positions[i+2] = oz + nz * displacement;
            }
        }
        
        this.geometry.attributes.position.needsUpdate = true;
        // With SphereGeometry, computeVertexNormals works well without tearing
        this.geometry.computeVertexNormals();
        
        // Pulse lights
        this.light1.intensity = 1 + audio.overall;
        this.light2.intensity = 1 + audio.bass * 2;
    }

    cleanup() {
        this.scene.remove(this.group);
        if(this.geometry) this.geometry.dispose();
        if(this.material) this.material.dispose();
    }
}
