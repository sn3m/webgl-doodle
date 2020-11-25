import Application from './Application.js';

import Renderer from './Renderer.js';
import Physics from './Physics.js';
import SceneLoader from './SceneLoader.js';
import SceneBuilder from './SceneBuilder.js';
import Player from './Player.js';

class App extends Application {

    initHandlers() {
        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(
          this
        );

        document.addEventListener(
          'pointerlockchange',
          this.pointerlockchangeHandler
        );

        this.elapsedTimeHandler();
    }

    start() {
        const gl = this.gl;

        this.renderer = new Renderer(gl);
        this.time = Date.now();
        this.startTime = this.time;
        this.aspect = 1;

        this.initHandlers();

        this.load('scene.json');
    }

    async load(uri) {
        const scene = await new SceneLoader().loadScene(uri);
        const builder = new SceneBuilder(scene);
        this.scene = builder.build();
        this.physics = new Physics(this.scene);

        // Find first camera.
        this.camera = null;
        this.player = null;
        this.scene.traverse((node) => {
            if (node instanceof Player) {
                this.player = node;
            }
        });

        this.camera = this.player.children[0];
        this.camera.aspect = this.aspect;
        this.camera.updateProjection();
        this.renderer.prepare(this.scene);
    }

    enableCamera() {
        this.canvas.requestPointerLock();
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

     elapsedTimeHandler() {
        // elapsedTime init
         Object.assign(this, {
             elapsedTime: "0"
         });

         let startTime;

         startTimer(this);

         function startTimer(context) {
             // get start time
             startTime = Date.now();

             setInterval(() => {
                 context.elapsedTime = getElapsedTime(startTime);
             }, 100);
         }

         function getElapsedTime(startTime) {
             let endTime = Date.now();
             let elapsedTime = new Date(endTime - startTime);

             // hours without added timezone
             let hours = Math.floor(elapsedTime/(60*60*1000));

             return hours + ":" + elapsedTime.getMinutes() + ":" + elapsedTime.getSeconds() + ":" + elapsedTime.getMilliseconds().toString().padStart(3,'0').charAt(0);
         }
    }

    update() {
        const t = (this.time = Date.now());
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        if (this.player) {
            this.player.update(dt);
        }

        if (this.physics) {
            this.physics.update(dt);
        }
    }

    render() {
        if (this.scene) {
            this.renderer.render(this.scene, this.camera);
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
    gui.add(app, 'elapsedTime').name("Elapsed time").listen();
});
