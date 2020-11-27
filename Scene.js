export default class Scene {
    constructor() {
        this.nodes = [];
    }

    addNode(node) {
        this.nodes.push(node);
    }

    removePlatform(platformId) {
        const index = this.nodes.findIndex(
            (node) => node.id && node.id === platformId,
        );
        if (index > -1) {
            this.nodes.splice(index, 1);
        }
    }

    traverse(before, after) {
        this.nodes.forEach((node) => node.traverse(before, after));
    }
}
