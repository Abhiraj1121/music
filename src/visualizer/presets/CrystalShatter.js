import * as THREE from 'three';

// A crystalline icosahedron broken into independent shard meshes that fly
// outward on beat hits, then drift back together — like a gem shattering
// and reforming in time with the music.
export class CrystalShatter {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = new THREE.Group();
        this.shards = [];
    }

    init() {
        this.scene.add(this.group);
        this.engine.camera.position.set(0, 5, 42);
        this.engine.camera.lookAt(0, 0, 0);

        this.material = new THREE.MeshBasicMaterial({
            color: this.engine.primaryColor,
            wireframe: true,
            transparent: true,
            opacity: 0.85
        });

        // Build a base icosahedron, then treat each face as an independent
        // "shard" mesh with its own tetrahedron-ish geometry so it can be
        // moved and rotated independently.
        const baseGeo = new THREE.IcosahedronGeometry(10, 0);
        const posAttr = baseGeo.attributes.position;

        for (let i = 0; i < posAttr.count; i += 3) {
            const a = new THREE.Vector3().fromBufferAttribute(posAttr, i);
            const b = new THREE.Vector3().fromBufferAttribute(posAttr, i + 1);
            const c = new THREE.Vector3().fromBufferAttribute(posAttr, i + 2);

            const center = new THREE.Vector3().add(a).add(b).add(c).divideScalar(3);
            const outward = center.clone().normalize();

            // Shard geometry: a thin tetrahedron built from the triangle + a
            // point pulled slightly toward the shard's own center.
            const shardGeo = new THREE.BufferGeometry();
            const localA = a.clone().sub(center);
            const localB = b.clone().sub(center);
            const localC = c.clone().sub(center);
            const inner = new THREE.Vector3(0, 0, 0).sub(outward.clone().multiplyScalar(1.2));

            const vertices = new Float32Array([
                localA.x, localA.y, localA.z,
                localB.x, localB.y, localB.z,
                localC.x, localC.y, localC.z,
                inner.x, inner.y, inner.z
            ]);
            shardGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            shardGeo.setIndex([0, 1, 2, 0, 1, 3, 1, 2, 3, 2, 0, 3]);
            shardGeo.computeVertexNormals();

            const mesh = new THREE.Mesh(shardGeo, this.material);
            mesh.position.copy(center);

            this.shards.push({
                mesh,
                restPosition: center.clone(),
                outward,
                explodeOffset: 0,
                rotSpeed: (Math.random() - 0.5) * 0.04
            });
            this.group.add(mesh);
        }

        this.explosion = 0;
    }

    onColorChange(color) {
        if (this.material) this.material.color = color;
    }

    update(audio) {
        this.group.rotation.y += 0.002 + audio.mid * 0.006;
        this.group.rotation.x += 0.0008;

        // Beats punch the explosion outward; it decays back to 0 (reformed) over time
        if (audio.isBeat) {
            this.explosion = 1.0;
        } else {
            this.explosion *= 0.93;
        }

        const spread = 4 + audio.bass * 10;

        this.shards.forEach((shard) => {
            const offset = shard.outward.clone().multiplyScalar(this.explosion * spread);
            shard.mesh.position.copy(shard.restPosition).add(offset);
            shard.mesh.rotation.x += shard.rotSpeed + audio.treble * 0.02;
            shard.mesh.rotation.y += shard.rotSpeed * 0.7;
        });

        if (audio.isBeat) {
            this.material.opacity = 1;
        } else {
            this.material.opacity = Math.max(0.55, this.material.opacity - 0.03);
        }
    }

    cleanup() {
        this.scene.remove(this.group);
        this.shards.forEach(s => s.mesh.geometry.dispose());
        if (this.material) this.material.dispose();
    }
}
