import * as THREE from 'three';

export class Kaleidoscope {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.meshes = [];
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 0, 50);
        this.engine.camera.lookAt(0, 0, 0);
        
        const geometry = new THREE.OctahedronGeometry(2, 0);
        this.material = new THREE.MeshBasicMaterial({
            color: this.engine.primaryColor,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });

        const numMeshes = 36;
        for (let i = 0; i < numMeshes; i++) {
            const mesh = new THREE.Mesh(geometry, this.material);
            
            // Distribute in a circle
            const angle = (i / numMeshes) * Math.PI * 2;
            const radius = 15;
            mesh.position.x = Math.cos(angle) * radius;
            mesh.position.y = Math.sin(angle) * radius;
            
            // Point towards center
            mesh.lookAt(0, 0, 0);
            
            this.meshes.push({
                mesh: mesh,
                angle: angle,
                baseRadius: radius
            });
            this.group.add(mesh);
        }
    }

    onColorChange(color) {
        if (this.material) this.material.color = color;
    }

    update(audio) {
        this.group.rotation.z += 0.002 + (audio.overall * 0.01);
        
        this.meshes.forEach((item, index) => {
            // Expand radius on bass
            const currentRadius = item.baseRadius + (audio.bass * 10);
            item.mesh.position.x = Math.cos(item.angle) * currentRadius;
            item.mesh.position.y = Math.sin(item.angle) * currentRadius;
            
            // Rotate individually on mid/treble
            item.mesh.rotation.x += 0.01 + (audio.mid * 0.1);
            item.mesh.rotation.y += 0.02 + (audio.treble * 0.1);
            
            // Scale based on overall energy and beat
            const scale = 1 + audio.overall + (audio.isBeat ? 1 : 0);
            item.mesh.scale.set(scale, scale, scale);
        });
    }

    cleanup() {
        this.scene.remove(this.group);
        if (this.meshes.length > 0) {
            this.meshes[0].mesh.geometry.dispose();
            this.material.dispose();
        }
    }
}
