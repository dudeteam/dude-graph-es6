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
        this[_redo] = [];
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

    /**
     * Changes the specified render node position to the specified position
     * @param {RenderNode} renderNode - specifies the render node
     * @param {Array<number>} position - specifies the position
     */
    changeRenderNodePosition(renderNode, position) {
        let oldPosition = renderNode.position;
        this.action(
            () => { renderNode.position = position; renderNode.updatePosition(); },
            () => { renderNode.position = oldPosition; renderNode.updatePosition(); }
        );
    }
    /**
     * Changes the specified render node name to the specified name
     * @param {RenderNode} renderNode - specifies the render node
     * @param {string} name - specifies the name
     */
    changeRenderNodeName(renderNode, name) {
        let oldName = renderNode.name;
        this.action(
            () => { renderNode.name = name; renderNode.updateAll(); },
            () => { renderNode.name = oldName; renderNode.updateAll(); }
        );
    }

    addPoint(graph, block, pointData) {}
    removePoint(graph, point) {}

    changePointValue(graph, point, value) {}
    changePointValueType(graph, point, valueType) {}

    addVariable(graph, variable) {}
    removeVariable(graph, variable) {}

}
