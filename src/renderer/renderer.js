import {select} from "d3";

let _d3svg = Symbol("d3svg");
let _renderBlocks = Symbol("renderBlocks");
let _renderConnections = Symbol("renderConnections");

export default class Renderer {

    constructor(svg) {
        this[_d3svg] = select(svg);
        this[_renderBlocks] = [];
        this[_renderConnections] = [];
    }

    /*
    // adds the render block and sets the renderer and sets/creates its svg:g element
    addRenderBlock(renderBlock) {}
    removeRenderBlock(renderBlock) {}
    renderBlockById(renderBlockId) {}
    renderBlocksByBlock(block) {}

    // adds the render group and sets the renderer and sets/creates its svg:g element
    addRenderGroup(renderGroup) {}
    removeRenderGroup(renderGroup) {}
    renderGroupById(renderGroupId) {}

    // adds the render point to the specified render block
    addRenderPoint(renderBlock, renderPoint) {}
    removeRenderPoint(renderPoint) {}
    renderPointByName(renderBlock, pointOutput, pointName) {}

    // adds the render connection and sets/create its svg:path element
    addRenderConnection(renderConnection) {}
    removeRenderConnection(renderConnection) {}
    renderConnectionByConnection(connection) {}
    */

}
