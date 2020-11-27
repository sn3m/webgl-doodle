import Node from './Node.js';
import Utils from './Utils.js';

export default class Coin extends Node {
    constructor(mesh, image, options) {
        super(options);
        this.mesh = mesh;
        this.image = image;
    }
}
