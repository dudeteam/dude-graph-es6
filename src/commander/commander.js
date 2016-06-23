/*eslint no-unused-vars: "off"*/
import forEach from "lodash-es/forEach";
import forEachRight from "lodash-es/forEachRight";

import RenderBlock from "../renderer/nodes/block";
import RenderGroup from "../renderer/nodes/group";

let _undo = Symbol("undo");
let _redo = Symbol("redo");
let _transactions = Symbol("transactions");

/**
 * This class handles add the possible actions on the graph and renderer
 * It also takes care of undoing/redoing these commands
 */
export default class Commander {

    constructor() {
        this[_undo] = [];
        this[_redo] = [];
        this[_transactions] = [];
    }

    /**
     * Adds an action in the commander
     * @param {function} redo - the function to make/redo the action
     * @param {function} undo - the function to undo the action
     */
    action(redo, undo) {
        let action = {
            "undo": undo,
            "redo": redo
        };
        if (this[_transactions].length > 0) {
            let transaction = this[_transactions].slice(-1)[0];
            transaction.push(action);
        } else {
            this[_undo].splice(0, 0, action);
            this[_redo] = [];
            redo();
        }
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
     * Starts a transaction of actions that will be grouped under a single action
     */
    transaction() {
        this[_transactions].push([]);
    }
    /**
     * Commits the latest transaction into a single action
     */
    commit() {
        if (this[_transactions].length === 0) {
            throw new Error("There is no transaction to commit");
        }
        let actions = this[_transactions].pop();
        if (actions.length > 0) {
            this.action(
                () => { forEach(actions, transaction => transaction.redo()); },
                () => { forEachRight(actions, transaction => transaction.undo()); }
            );
        }
    }
    /**
     * Cancels the latest transaction
     */
    rollback() {
        if (this[_transactions].length === 0) {
            throw new Error("There is no transaction to rollback");
        }
        this[_transactions].pop();
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
        this.transaction();
        {
            if (renderBlock.parent !== null) {
                this.removeRenderGroupRenderBlock(renderBlock.parent, renderBlock);
            }
            this.action(
                () => { renderer.removeRenderBlock(renderBlock); },
                () => { renderer.addRenderBlock(renderBlock); renderBlock.updateAll(); }
            );
        }
        this.commit();
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
        this.transaction();
        {
            forEachRight(renderGroup.renderBlocks, (renderBlock) => {
                this.removeRenderGroupRenderBlock(renderGroup, renderBlock);
            });
            this.action(
                () => { renderer.removeRenderGroup(renderGroup); },
                () => { renderer.addRenderGroup(renderGroup); renderGroup.updateAll(); }
            );
        }
        this.commit();
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

    /**
     * Registers undo/redo zoom for the specified renderer
     * @param {Renderer} renderer - specifies the renderer
     */
    registerZoom(renderer) {
        let origin = {"zoom": 1, "pan": [0, 0]};
        renderer.zoomDrag.on("start", () => {
            origin.zoom = renderer.zoomPan.zoom;
            origin.pan = renderer.zoomPan.pan;
        });
        renderer.zoomDrag.on("zoom", (a, b, e) => {
            let zoom = e[0].__zoom;
            renderer.zoomAndPan(zoom.k, [zoom.x, zoom.y]);
        });
        renderer.zoomDrag.on("end", (a, b, e) => {
            let zoom = e[0].__zoom;
            let zoomPan = {"zoom": origin.zoom, "pan": origin.pan};
            this.action(
                () => { renderer.zoomAndPan(zoom.k, [zoom.x, zoom.y]); },
                () => { renderer.zoomAndPan(zoomPan.zoom, zoomPan.pan); }
            )
        });
    }
}
