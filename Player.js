import Utils from './Utils.js';
import Node from './Node.js';

const vec3 = glMatrix.vec3;
const vec2 = glMatrix.vec2;

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
        this.jump = false;
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

        // 1.5: add vertical acceleration
        let accUp = -0.5; // gravity strength
        if (this.jump) {
            accUp = 20;
            this.jump = false;
        }
        const up = vec3.set(vec3.create(), 0, accUp, 0);
        vec3.add(acc, acc, up);

        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

        // 3: if no movement, apply friction on X and Z axis
        const xzVelocity = vec2.set(
            vec2.create(),
            c.velocity[0],
            c.velocity[2],
        );
        if (
            !this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA']
        ) {
            vec2.scale(xzVelocity, xzVelocity, 1 - c.friction);
        }

        // 4: limit speed on X and Z axis
        const len = vec2.len(xzVelocity);
        if (len > c.maxSpeed) {
            vec2.scale(xzVelocity, xzVelocity, c.maxSpeed / len);
        }

        // 5: apply new velocity
        c.velocity = vec3.set(
            vec3.create(),
            xzVelocity[0],
            c.velocity[1],
            xzVelocity[1],
        );
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
        const cLimitUp = pi / 64;
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
