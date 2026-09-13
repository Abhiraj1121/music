import * as THREE from 'three';

// A double-helix of glowing spheres connected by rungs, twisting and
// stretching along its axis in response to the music.
export class DNAHelix {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.nodesA = [];
        this.nodesB = [];
        this.rungs = [];
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 0, 55);
        this.engine.camera.lookAt(0, 0, 0);

        const nodeCount = 40;
        const radius = 8;
        const height = 60;

        const sphereGeo = new THREE.SphereGeometry(0.9, 10, 10);

        this.materialA = new THREE.MeshBasicMaterial({
            color: this.engine.primaryColor,
            transparent: true,
            opacity: 0.9
        });
        this.materialB = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6
        });

        for (let i = 0; i < nodeCount; i++) {
            const t = i / nodeCount;
            const angle = t * Math.PI * 8;
            const y = (t - 0.5) * height;

            const nodeA = new THREE.Mesh(sphereGeo, this.materialA);
            nodeA.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
            this.nodesA.push({ mesh: nodeA, angle, y, index: i });
            this.group.add(nodeA);

            const nodeB = new THREE.Mesh(sphereGeo, this.materialB);
            const angleB = angle + Math.PI;
            nodeB.position.set(Math.cos(angleB) * radius, y, Math.sin(angleB) * radius);
            this.nodesB.push({ mesh: nodeB, angle: angleB, y, index: i });
            this.group.add(nodeB);

            // Connective rung every few nodes
            if (i % 3 === 0) {
                const rungGeo = new THREE.BufferGeometry().setFromPoints([
                    nodeA.position.clone(),
                    nodeB.position.clone()
                ]);
                const rungMat = new THREE.LineBasicMaterial({
                    color: this.engine.primaryColor,
                    transparent: true,
                    opacity: 0.35
                });
                const rung = new THREE.Line(rungGeo, rungMat);
                this.rungs.push({ line: rung, indexA: i, indexB: i });
                this.group.add(rung);
            }
        }

        this.radius = radius;
        this.height = height;
        this.time = 0;
    }

    onColorChange(color) {
        if (this.materialA) this.materialA.color = color;
        this.rungs.forEach(r => r.line.material.color = color);
    }

    update(audio) {
        this.time += 0.02;
        this.group.rotation.y += 0.004 + audio.mid * 0.01;

        const radiusPulse = this.radius * (1 + audio.bass * 0.4);

        this.nodesA.forEach((node) => {
            const twist = this.time * 1.5;
            const angle = node.angle + twist;
            node.mesh.position.x = Math.cos(angle) * radiusPulse;
            node.mesh.position.z = Math.sin(angle) * radiusPulse;
            const scale = 1 + audio.treble * 1.2;
            node.mesh.scale.setScalar(scale);
        });

        this.nodesB.forEach((node) => {
            const twist = this.time * 1.5;
            const angle = node.angle + twist;
            node.mesh.position.x = Math.cos(angle) * radiusPulse;
            node.mesh.position.z = Math.sin(angle) * radiusPulse;
            const scale = 1 + audio.treble * 1.2;
            node.mesh.scale.setScalar(scale);
        });

        // Update rungs to follow their connected nodes
        this.rungs.forEach((rung) => {
            const a = this.nodesA[rung.indexA].mesh.position;
            const b = this.nodesB[rung.indexB].mesh.position;
            const positions = rung.line.geometry.attributes.position;
            positions.setXYZ(0, a.x, a.y, a.z);
            positions.setXYZ(1, b.x, b.y, b.z);
            positions.needsUpdate = true;
        });

        if (audio.isBeat) {
            this.materialA.opacity = 1;
        } else {
            this.materialA.opacity = Math.max(0.6, this.materialA.opacity - 0.03);
        }
    }

    cleanup() {
        this.scene.remove(this.group);
        if (this.nodesA.length) this.nodesA[0].mesh.geometry.dispose();
        if (this.materialA) this.materialA.dispose();
        if (this.materialB) this.materialB.dispose();
        this.rungs.forEach(r => {
            r.line.geometry.dispose();
            r.line.material.dispose();
        });
    }
}
