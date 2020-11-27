import SceneBuilder from './SceneBuilder.js';
import Physics from './Physics.js';
import Mesh from './Mesh.js';
import Platform from './Platform.js';

export default class Level {
    constructor(spec, renderer) {
        this.spec = spec;
        this.scene = {};
        this.platformCount = 0;
        this.lastPlatform = {};
        this.renderer = renderer;

        this.levelVelocity = 3;
        this.separation = 4;
    }

    build() {
        const builder = new SceneBuilder(this.spec);
        this.scene = builder.build();
        for (let i = 0; i < 5; i++) {
            this.addPlatform(0, 0, i * -this.separation);
        }
        console.log(this.scene);
    }

    update(dt) {
        this.scene.traverse((node) => {
            if (node instanceof Platform && node.translation[2] > 10) {
                this.scene.removePlatform(node.id);
                this.addPlatform(
                    0,
                    0,
                    this.lastPlatform.translation[2] - this.separation,
                    true,
                );
            }
        });

        Physics.update(this.scene, dt);
    }

    move(isMove) {
        this.scene.traverse((node) => {
            if (node instanceof Platform) {
                if (isMove) {
                    node.velocity[2] = this.levelVelocity;
                } else {
                    node.velocity[2] = 0;
                }
            }
        });
    }

    addPlatform(x, y, z, isDynamic = false) {
        console.log('add platform', z);
        const id = this.platformCount + 1;
        this.platformCount++;
        const mesh = new Mesh(this.spec.meshes[0]);
        const texture = this.spec.textures[1];
        const spec = {
            type: 'platform',
            mesh: 0,
            texture: 1,
            aabb: {
                min: [-1, -0.2, -1],
                max: [1, 0.2, 1],
            },
            translation: [0 + x, -0.2 + y, 0 + z],
            scale: [1, 0.2, 1],
        };
        if (isDynamic) {
            spec.velocity = [0, 0, this.levelVelocity];
        }
        const platform = new Platform(id, mesh, texture, spec);

        this.scene.addNode(platform);
        this.lastPlatform = platform;

        if (isDynamic) {
            this.renderer.prepareNode(platform);
        }
    }
}
