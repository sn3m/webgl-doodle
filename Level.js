import SceneBuilder from './SceneBuilder.js';
import Physics from './Physics.js';
import Mesh from './Mesh.js';
import Platform from './Platform.js';
import Coin from './Coin.js';

export default class Level {
    constructor(spec, renderer) {
        this.spec = spec;
        this.scene = {};
        this.platformCount = 0;
        this.lastPlatform = {};
        this.renderer = renderer;

        this.levelVelocity = 2.3;
        this.separation = 3;
    }

    build() {
        const builder = new SceneBuilder(this.spec);
        this.scene = builder.build();
        for (let i = 0; i < 10; i++) {
            let coords = [0, 0, i * -this.separation];
            if (i > 1) {
                coords = this.randomizePlatformCoords(coords);
                this.addPlatform(coords[0], coords[1], coords[2]);
            } else {
                this.addPlatform(coords[0], coords[1], coords[2], false, true);
            }
        }
    }

    update(dt) {
        this.scene.traverse((node) => {
            if (node instanceof Platform && node.translation[2] > 10) {
                this.scene.removePlatform(node.id);
                const coords = this.randomizePlatformCoords([
                    0,
                    0,
                    this.lastPlatform.translation[2] - this.separation,
                ]);
                this.addPlatform(coords[0], coords[1], coords[2], true);
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

    addPlatform(x, y, z, isDynamic = false, noCoin = false) {
        const id = this.platformCount + 1;
        this.platformCount++;

        const mesh = new Mesh(this.spec.meshes[3]);
        const texture = this.spec.textures[3];
        const spec = {
            type: 'platform',
            mesh: 3,
            texture: 3,
            aabb: {
                min: [-0.8, -0.2, -0.8],
                max: [0.8, 0.2, 0.8],
            },
            translation: [0 + x, -0.2 + y, 0 + z],
            scale: [1.5, 1.5, 1.5],
        };
        if (isDynamic) {
            spec.velocity = [0, 0, this.levelVelocity];
        }
        const platform = new Platform(id, mesh, texture, spec);

        const coin = noCoin ? null : this.getCoin();
        if (coin) {
            platform.addChild(coin);
        }

        this.scene.addNode(platform);
        this.lastPlatform = platform;

        if (isDynamic) {
            this.renderer.prepareNode(platform);
        }
    }

    randomizePlatformCoords(coords) {
        const newCoords = coords.slice();
        newCoords[0] = newCoords[0] + this.getRandom(3);
        newCoords[1] = newCoords[1] + this.getRandom();
        newCoords[2] = newCoords[2] + this.getRandom(0.5);
        return newCoords;
    }

    getRandom(factor = 1) {
        return Number.parseFloat(((Math.random() - 0.5) * factor).toFixed(2));
    }

    getCoin() {
        if (Math.random() > 0.4) {
            return null;
        }

        const mesh = new Mesh(this.spec.meshes[4]);
        const texture = this.spec.textures[4];
        const spec = {
            type: 'coin',
            mesh: 4,
            texture: 4,
            aabb: {
                min: [0.1, -0.2, -0.2],
                max: [0.4, 0.2, 0.2],
            },
            translation: [-0.15, 0.4, -0.2],
            rotation: [0, 1.5, 0],
            scale: [1, 1, 1],
        };

        const coin = new Coin(mesh, texture, spec);
        this.renderer.prepareNode(coin);

        return coin;
    }
}
