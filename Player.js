import Utils from './Utils.js';
import Node from './Node.js';

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

export default class Player extends Node {
    constructor(mesh, image, options) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);

        this.mesh = mesh;
        this.image = image;

        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};
    }

    update(dt) {
        const c = this;

        const forward = vec3.set(
            vec3.create(),
            -Math.sin(c.rotation[1]),
            0,
            -Math.cos(c.rotation[1]),
        );
        const right = vec3.set(
            vec3.create(),
            Math.cos(c.rotation[1]),
            0,
            -Math.sin(c.rotation[1]),
        );

        // 1: add movement acceleration
        let acc = vec3.create();
        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }

        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

        // 3: if no movement, apply friction
        if (
            !this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA']
        ) {
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
        }

        // 4: limit speed
        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }
    }

    enable() {
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disable() {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    mousemoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;
        const p = this;
        const c = this.children[0];

        c.rotation[0] -= dy * c.mouseSensitivity;
        p.rotation[1] -= dx * c.mouseSensitivity;

        const pi = Math.PI;
        const twopi = pi * 2;
        const cLimitUp = pi / 5;
        const cLimitDown = pi / 4;

        if (c.rotation[0] > cLimitUp) {
            c.rotation[0] = cLimitUp;
        }
        if (c.rotation[0] < -cLimitDown) {
            c.rotation[0] = -cLimitDown;
        }

        p.rotation[1] = ((p.rotation[1] % twopi) + twopi) % twopi;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }
}

Player.defaults = {
    velocity: [0, 0, 0],
    mouseSensitivity: 0.002,
    maxSpeed: 3,
    friction: 0.2,
    acceleration: 20,
};
