import * as THREE from 'three';

export class NeonTunnel {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.rings = [];
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 0, 0);
        this.engine.camera.lookAt(0, 0, -10);
        
        const geometry = new THREE.TorusGeometry(10, 0.2, 16, 100);
        this.material = new THREE.MeshBasicMaterial({
            color: this.engine.primaryColor,
            wireframe: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.5
        });

        for (let i = 0; i < 30; i++) {
            const mesh = new THREE.Mesh(geometry, this.material);
            mesh.position.z = -i * 10;
            this.rings.push(mesh);
            this.group.add(mesh);
        }
    }

    onColorChange(color) {
        if (this.material) this.material.color = color;
    }

    update(audio) {
        const speed = 0.5 + (audio.overall * 2);
        
        this.rings.forEach((ring, i) => {
            ring.position.z += speed;
            if (ring.position.z > 10) {
                ring.position.z -= 300;
            }
            
            // Pulse on beat
            const scale = 1 + (audio.bass * 0.4) * (1 - (i / 30));
            ring.scale.set(scale, scale, 1);
            
            // Rotate based on mid
            ring.rotation.z += 0.01 * audio.mid;
        });
        
        // Shake camera on treble
        this.engine.camera.position.x = Math.sin(Date.now() * 0.01) * (audio.treble * 0.5);
        this.engine.camera.position.y = Math.cos(Date.now() * 0.01) * (audio.treble * 0.5);
    }

    cleanup() {
        this.scene.remove(this.group);
        if (this.rings.length > 0) {
            this.rings[0].geometry.dispose();
            this.material.dispose();
        }
    }
}
