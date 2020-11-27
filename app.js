import Application from './Application.js';

import Renderer from './Renderer.js';
import SceneLoader from './SceneLoader.js';
import Player from './Player.js';
import Level from './Level.js';

class App extends Application {
    start() {
        const gl = this.gl;

        this.renderer = new Renderer(gl);
        this.time = Date.now();
        this.startTime = this.time;
        this.aspect = 1;

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(
            this,
        );
        document.addEventListener(
            'pointerlockchange',
            this.pointerlockchangeHandler,
        );

        this.load('scene.json');
    }

    async load(uri) {
        const scene = await new SceneLoader().loadScene(uri);
        this.level = new Level(scene, this.renderer);
        this.level.build();

        // Find first camera.
        this.camera = null;
        this.player = null;
        this.level.scene.traverse((node) => {
            if (node instanceof Player) {
                this.player = node;
            }
        });

        this.camera = this.player.children[0];
        this.camera.aspect = this.aspect;
        this.camera.updateProjection();
        this.renderer.prepare(this.level.scene);
    }

    enableCamera() {
        this.canvas.requestPointerLock();
        this.level.move(true);
    }

    pointerlockchangeHandler() {
        if (!this.camera) {
            return;
        }

        if (document.pointerLockElement === this.canvas) {
            this.player.enable();
        } else {
            this.player.disable();
        }
    }

    update() {
        const t = (this.time = Date.now());
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        if (this.player) {
            this.player.update(dt);
        }

        if (this.level) {
            this.level.update(dt);
        }
    }

    render() {
        if (this.level && this.level.scene) {
            this.renderer.render(this.level.scene, this.camera);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.aspect = w / h;
        if (this.camera) {
            this.camera.aspect = this.aspect;
            this.camera.updateProjection();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    const gui = new dat.GUI();
    gui.add(app, 'enableCamera');
});
