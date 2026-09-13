import * as THREE from 'three';

export class AudioCube {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 20, 40);
        this.engine.camera.lookAt(0, 0, 0);

        const geometry = new THREE.BoxGeometry(15, 15, 15);
        this.material = new THREE.MeshBasicMaterial({
            color: this.engine.primaryColor,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });

        this.cube = new THREE.Mesh(geometry, this.material);
        this.group.add(this.cube);

        // Add inner cube
        this.innerCube = new THREE.Mesh(
            new THREE.BoxGeometry(10, 10, 10),
            new THREE.MeshBasicMaterial({
                color: this.engine.primaryColor,
                wireframe: false,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending
            })
        );
        this.group.add(this.innerCube);
    }

    onColorChange(color) {
        if (this.material) this.material.color = color;
        if (this.innerCube) this.innerCube.material.color = color;
    }

    update(audio) {
        this.group.rotation.y += 0.005 + (audio.mid * 0.02);
        this.group.rotation.x += 0.005 + (audio.bass * 0.01);

        const scale = 1 + audio.bass * 0.5;
        this.cube.scale.set(scale, scale, scale);

        const innerScale = 1 + audio.treble * 0.8;
        this.innerCube.scale.set(innerScale, innerScale, innerScale);
        this.innerCube.rotation.x -= 0.01;
        this.innerCube.rotation.y -= 0.01;

        if (audio.isBeat) {
            this.material.opacity = 1;
        } else {
            this.material.opacity = Math.max(0.4, this.material.opacity - 0.05);
        }
    }

    cleanup() {
        this.scene.remove(this.group);
        if (this.cube) this.cube.geometry.dispose();
        if (this.material) this.material.dispose();
        if (this.innerCube) {
            this.innerCube.geometry.dispose();
            this.innerCube.material.dispose();
        }
    }
}
