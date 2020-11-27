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
        this.cameraHandler = this.cameraHandler.bind(this);
        this.resume = this.resume.bind(this);

        document.addEventListener(
          'pointerlockchange',
          this.pointerlockchangeHandler
        );

        this.enableEventListeners();
    }

    start() {
        const gl = this.gl;

        this.renderer = new Renderer(gl);
        this.time = Date.now();
        this.startTime = this.time;
        this.aspect = 1;

        Object.assign(this, {
            score: 0,
            scoreInterval: undefined,
            isPaused: true,
            //isStart: true
        });

        this.initHandlers(this);

        this.gameStart();

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
            if(this.isPaused) {
                this.isPaused = false;
                this.player.enable();
                if(this.scoreInterval === undefined) {
                    this.scoreHandler(this,'enable');
                }
                // new time
                this.startTime = Date.now();
                // continue the animation loop
                this._update();
            }
            /*if(this.isStart) {
                this.isStart = false;
                this.player.enable();
                if(this.scoreInterval === undefined) {
                    this.scoreHandler(this,'enable');
                }
            }*/
        } else {
            this.isPaused = true;
            this.player.disable();
            this.scoreHandler(this,'disable');
            this.showMenu();
        }
    }

    scoreHandler(context, action) {
        if(action === 'enable') {
            context.scoreInterval = setInterval(() => {
                context.score += 1;
                document.getElementById("score").innerText = context.score;
              },100);
        }
        else if(action === 'disable') {
            // Clear interval
            if (typeof context.scoreInterval !== "undefined") {
                clearInterval(context.scoreInterval);
                context.scoreInterval = undefined;
            }
        }
    }

    cameraHandler() {
        this.enableCamera();
    }

    showMenu() {
        this.disableEventListeners();
        document.getElementById("pause-overlay").style.display = "block";
        document.getElementById("pause-controls").style.visibility = "visible";
        this.pause();
    }

    pause() {
        let textHeader = document.createElement("h1");
        let text = document.createTextNode("The game is paused.");
        textHeader.appendChild(text);
        document.getElementById("pause-controls").appendChild(textHeader);
        let btn = document.createElement("BUTTON");
        btn.innerText = "Resume";
        btn.className = "pause-button";
        btn.id = "pause-resume";
        document.getElementById("pause-controls").appendChild(btn);
        document.getElementById("pause-resume").addEventListener("click", this.resume);
    }

    resume() {
        document.getElementById("pause-overlay").style.display = "none";
        document.getElementById("pause-controls").style.visibility = "hidden";
        this.enableEventListeners();

        // clean up
        let myNode = document.getElementById("pause-controls");
        let fc = myNode.firstChild;

        while( fc ) {
            myNode.removeChild( fc );
            fc = myNode.firstChild;
        }
        document.removeEventListener("pause-resume", this.resume);
    }

    gameOver() {
        let textHeader = document.createElement("h1");
        let text = document.createTextNode("GAME OVER");
        textHeader.appendChild(text);
        document.getElementById("pause-controls").appendChild(textHeader);
        textHeader = document.createElement("h1");
        text = document.createTextNode("Your score: " + this.score);
        textHeader.appendChild(text);
        document.getElementById("pause-controls").appendChild(textHeader);
        let btn = document.createElement("BUTTON");
        btn.innerText = "Play again";
        btn.className = "pause-button";
        btn.onclick = function(){
            location.href='game.html';
        };
        document.getElementById("pause-controls").appendChild(btn);
    }

    gameStart() {
        document.getElementById("wrapper").style.display = "block";
        let textHeader = document.createElement("div");
        textHeader.className = "title";
        let text = document.createTextNode("Doodle Jump 3D");
        textHeader.appendChild(text);
        document.getElementById("wrapper").appendChild(textHeader);
        let btn = document.createElement("BUTTON");
        btn.innerText = "PLAY";
        btn.className = "main-button";
        btn.id = "pause-resume";
        document.getElementById("wrapper").appendChild(btn);
        document.getElementById("pause-resume").addEventListener("click", this.resumeStart);
    }

    resumeStart() {
        document.getElementById("wrapper").style.display = "none";
        //this.enableEventListeners();

        // clean up
        let myNode = document.getElementById("wrapper");
        let fc = myNode.firstChild;

        while( fc ) {
            myNode.removeChild( fc );
            fc = myNode.firstChild;
        }
        document.removeEventListener("pause-resume", this.resumeStart);
    }

    enableEventListeners() {
        document.addEventListener("click", this.cameraHandler);
    }

    disableEventListeners() {
        document.removeEventListener('click', this.cameraHandler);
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
    //const gui = new dat.GUI();
});
