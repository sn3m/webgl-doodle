import Node from './Node.js';
import Utils from './Utils.js';

export default class Platform extends Node {
    constructor(id, mesh, image, options) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);

        this.id = id;
        this.mesh = mesh;
        this.image = image;
    }
}

Platform.defaults = {
    velocity: [0, 0, 0],
};
