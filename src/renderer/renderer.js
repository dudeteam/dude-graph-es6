let _renderBlocks = Symbol("renderBlocks");
let _renderConnections = Symbol("renderConnections");

export default class Renderer {

    constructor() {
        this[_renderBlocks] = [];
        this[_renderConnections] = [];
    }

}
