/*eslint no-unused-vars: "off"*/
import RenderBlock from "../renderer/nodes/block";
import RenderGroup from "../renderer/nodes/group";

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
     */
    action(redo, undo) {
        this[_undo].splice(0, 0, {
            "undo": undo,
            "redo": redo
        });
        this[_redo] = [];
        redo();
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
     * @param {RenderBlock} renderBlock - @see {Renderer.addRenderBlock}
     */
    addRenderBlock(renderer, renderBlock) {
        this.action(
            () => { renderer.addRenderBlock(renderBlock); renderBlock.updateAll(); },
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
            () => { renderer.addRenderBlock(renderBlock); renderBlock.updateAll(); }
        );
    }

    addRenderConnection(renderer, renderOutputPoint, renderInputPoint) {}
    removeRenderConnection(renderer, renderConnection) {}

    /**
     * @see {Renderer.addRenderGroup}
     * @param {Renderer} renderer - @see {Renderer.addRenderGroup}
     * @param {RenderGroup} renderGroup - @see {Renderer.addRenderGroup}
     * @returns {RenderGroup}
     */
    addRenderGroup(renderer, renderGroup) {
        return this.action(
            () => { renderer.addRenderGroup(renderGroup); renderGroup.updateAll(); },
            () => { renderer.removeRenderGroup(renderGroup); }
        );
    }
    /**
     * @see {Renderer.addRenderGroup}
     * @param {Renderer} renderer - @see {Renderer.addRenderGroup}
     * @param {RenderGroup} renderGroup - @see {Renderer.addRenderGroup}
     */
    removeRenderGroup(renderer, renderGroup) {
        this.action(
            () => { renderer.removeRenderGroup(renderGroup); },
            () => { renderer.addRenderGroup(renderGroup); renderGroup.updateAll(); }
        );
    }
    /**
     * @see {RenderGroup.addRenderBlock}
     * @param {RenderGroup} renderGroup - @see {RenderGroup.addRenderBlock}
     * @param {RenderBlock} renderBlock - @see {RenderGroup.addRenderBlock}
     */
    addRenderGroupRenderBlock(renderGroup, renderBlock) {
        this.action(
            () => { renderGroup.addRenderBlock(renderBlock); renderGroup.updateAll(); },
            () => { renderGroup.removeRenderBlock(renderBlock); renderGroup.updateAll(); }
        );
    }
    /**
     * @see {RenderGroup.removeRenderBlock}
     * @param {RenderGroup} renderGroup - @see {RenderGroup.removeRenderBlock}
     * @param {RenderBlock} renderBlock - @see {RenderGroup.removeRenderBlock}
     */
    removeRenderGroupRenderBlock(renderGroup, renderBlock) {
        this.action(
            () => { renderGroup.removeRenderBlock(renderBlock); renderGroup.updateAll(); },
            () => { renderGroup.addRenderBlock(renderBlock); renderGroup.updateAll(); }
        );
    }

    /**
     * Changes the specified render node position to the specified position
     * @param {RenderNode} renderNode - specifies the render node
     * @param {Array<number>} position - specifies the position
     */
    changeRenderNodePosition(renderNode, position) {
        let oldPosition = renderNode.position;
        this.action(
            () => {
                renderNode.position = position;
                renderNode.updatePosition();
                if (renderNode instanceof RenderBlock && renderNode.parent !== null) {
                    renderNode.parent.updatePosition();
                    renderNode.parent.updateSize();
                }
            },
            () => {
                renderNode.position = oldPosition;
                renderNode.updatePosition();
                if (renderNode instanceof RenderBlock && renderNode.parent !== null) {
                    renderNode.parent.updatePosition();
                    renderNode.parent.updateSize();
                }
            }
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
