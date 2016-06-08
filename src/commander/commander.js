/*eslint no-unused-vars: "off"*/

let _commanderHistory = Symbol("commanderHistory");

/**
 * This class handles add the possible commands on the graph and renderer. It also takes care of undoing/redoing these
 * commands
 */
export default class Commander {

    constructor() {
        this[_commanderHistory] = [];
    }

    undo() {}
    redo() {}

    changeZoom(zoom) { }

    addRenderBlock(block, renderBlockData) {}
    removeRenderBlock(renderBlock) {}

    addRenderConnection(renderOutputPoint, renderInputPoint) {}
    removeRenderConnection(renderConnection) {}

    addRenderGroup(renderGroupData) {}
    removeRenderGroup(renderGroup) {}
    addRenderBlockToRenderGroup(renderBlock, renderGroup) {}
    removeRenderBlockToRenderGroup(renderBlock, renderGroup) {}

    changeRenderNodePosition(renderNode, position) {}
    changeRenderNodeName(renderNode, name) {}

    addPoint(block, pointData) {}
    removePoint(point) {}

    changePointValue(point, value) {}
    changePointValueType(point, valueType) {}

    addVariable(variable) {}
    removeVariable(variable) {}

}
