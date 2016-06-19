/*eslint no-unused-vars: "off"*/
import RenderBlock from "../renderer/nodes/block";

let _undo = Symbol("undo");
let _redo = Symbol("redo");

/**
 * This class handles add the possible actions on the graph and renderer
 * It also takes care of undoing/redoing these commands
 */
export default class Commander {

    constructor() {
        this[_undo] = [];
        this[_redo] = [];
    }

    /**
     * Adds an action in the commander
     * @param {function} redo - the function to make/redo the action
     * @param {function} undo - the function to undo the action
     * @returns {*} - returns the value returned by redo
     */
    action(redo, undo) {
        this[_undo].splice(0, 0, {
            "undo": undo,
            "redo": redo
        });
        return redo();
    }

    /**
     * Undoes the last action
     */
    undo() {
        let undo = this[_undo].shift();
        if (typeof undo !== "undefined") {
            undo.undo();
            this[_redo].splice(0, 0, undo);
        }
    }
    /**
     * Redoes the last undone action
     */
    redo() {
        let redo = this[_redo].shift();
        if (typeof redo !== "undefined") {
            redo.redo();
            this[_undo].splice(0, 0, redo);
        }
    }

    /**
     * @see {Renderer.addRenderBlock}
     * @param {Renderer} renderer - @see {Renderer.addRenderBlock}
     * @param {Block} block - @see {Renderer.addRenderBlock}
     * @returns {RenderBlock} - @see {Renderer.addRenderBlock}
     */
    addRenderBlock(renderer, block) {
        let renderBlock = new RenderBlock(block);
        return this.action(
            () => { renderer.addRenderBlock(renderBlock); renderBlock.updateAll(); return renderBlock; },
            () => { renderer.removeRenderBlock(renderBlock); }
        );
    }
    /**
     * @see {Renderer.removeRenderBlock}
     * @param {Renderer} renderer - @see {Renderer.removeRenderBlock}
     * @param {RenderBlock} renderBlock - @see {Renderer.removeRenderBlock}
     */
    removeRenderBlock(renderer, renderBlock) {
        this.action(
            () => { renderer.removeRenderBlock(renderBlock); },
            () => { renderer.addRenderBlock(renderBlock); }
        );
    }

    addRenderConnection(renderer, renderOutputPoint, renderInputPoint) {}
    removeRenderConnection(renderer, renderConnection) {}

    addRenderGroup(renderer, renderGroupData) {}
    removeRenderGroup(renderer, renderGroup) {}
    addRenderBlockToRenderGroup(renderer, renderBlock, renderGroup) {}
    removeRenderBlockToRenderGroup(renderer, renderBlock, renderGroup) {}

    changeRenderNodePosition(renderer, renderNode, position) {}
    changeRenderNodeName(renderer, renderNode, name) {}

    addPoint(graph, block, pointData) {}
    removePoint(graph, point) {}

    changePointValue(graph, point, value) {}
    changePointValueType(graph, point, valueType) {}

    addVariable(graph, variable) {}
    removeVariable(graph, variable) {}

}
