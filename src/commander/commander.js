/*eslint no-unused-vars: "off"*/
import forEach from "lodash-es/forEach";
import forEachRight from "lodash-es/forEachRight";

import RenderBlock from "../renderer/nodes/block";
import RenderGroup from "../renderer/nodes/group";

let _renderer = Symbol("renderer");
let _transactions = Symbol("transactions");
let _undo = Symbol("undo");
let _redo = Symbol("redo");

/**
 * This class handles add the possible commands on the graph and renderer
 * It also takes care of undoing/redoing these commands
 */
export default class Commander {

    /**
     * Creates a commander for the specified renderer
     * @param {Renderer} renderer - specifies the renderer
     */
    constructor(renderer) {
        this[_renderer] = renderer;
        this[_transactions] = [];
        this[_undo] = [];
        this[_redo] = [];
    }

    /**
     * Adds an command in the commander
     * @param {function} redo - the function to make/redo the command
     * @param {function} undo - the function to undo the command
     */
    command(redo, undo) {
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
     * Undoes the last command
     */
    undo() {
        let undo = this[_undo].shift();
        if (typeof undo !== "undefined") {
            undo.undo();
            this[_redo].splice(0, 0, undo);
        }
    }
    /**
     * Redoes the last undone command
     */
    redo() {
        let redo = this[_redo].shift();
        if (typeof redo !== "undefined") {
            redo.redo();
            this[_undo].splice(0, 0, redo);
        }
    }

    /**
     * Starts a transaction of commands that will be grouped under a single command
     */
    transaction() {
        this[_transactions].push([]);
    }
    /**
     * Commits the latest transaction into a single command
     */
    commit() {
        if (this[_transactions].length === 0) {
            throw new Error("There is no transaction to commit");
        }
        let actions = this[_transactions].pop();
        if (actions.length > 0) {
            this.command(
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
     * @param {RenderBlock} renderBlock - @see {Renderer.addRenderBlock}
     */
    addRenderBlock(renderBlock) {
        this.command(
            () => { this[_renderer].addRenderBlock(renderBlock); renderBlock.updateAll(); },
            () => { this[_renderer].removeRenderBlock(renderBlock); }
        );
    }
    /**
     * @see {Renderer.removeRenderBlock}
     * @param {RenderBlock} renderBlock - @see {Renderer.removeRenderBlock}
     */
    removeRenderBlock(renderBlock) {
        this.transaction();
        {
            if (renderBlock.parent !== null) {
                this.removeRenderGroupRenderBlock(renderBlock.parent, renderBlock);
            }
            this.command(
                () => { this[_renderer].removeRenderBlock(renderBlock); },
                () => { this[_renderer].addRenderBlock(renderBlock); renderBlock.updateAll(); }
            );
        }
        this.commit();
    }

    addRenderConnection(renderOutputPoint, renderInputPoint) {}
    removeRenderConnection(renderConnection) {}

    /**
     * @see {Renderer.addRenderGroup}
     * @param {RenderGroup} renderGroup - @see {Renderer.addRenderGroup}
     * @returns {RenderGroup}
     */
    addRenderGroup(renderGroup) {
        return this.command(
            () => { this[_renderer].addRenderGroup(renderGroup); renderGroup.updateAll(); },
            () => { this[_renderer].removeRenderGroup(renderGroup); }
        );
    }
    /**
     * @see {Renderer.addRenderGroup}
     * @param {RenderGroup} renderGroup - @see {Renderer.addRenderGroup}
     */
    removeRenderGroup(renderGroup) {
        this.transaction();
        {
            forEachRight(renderGroup.renderBlocks, (renderBlock) => {
                this.removeRenderGroupRenderBlock(renderGroup, renderBlock);
            });
            this.command(
                () => { this[_renderer].removeRenderGroup(renderGroup); },
                () => { this[_renderer].addRenderGroup(renderGroup); renderGroup.updateAll(); }
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
        this.command(
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
        this.command(
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
        this.command(
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
        this.command(
            () => { renderNode.name = name; renderNode.updateAll(); },
            () => { renderNode.name = oldName; renderNode.updateAll(); }
        );
    }

    /**
     * Registers undo/redo zoom for the specified renderer
     */
    registerZoom() {
        let origin = {"zoom": 1, "pan": [0, 0]};
        this[_renderer].zoomDrag.on("start", () => {
            origin.zoom = this[_renderer].zoomPan.zoom;
            origin.pan = this[_renderer].zoomPan.pan;
        });
        this[_renderer].zoomDrag.on("zoom", (a, b, e) => {
            let zoom = e[0].__zoom;
            this[_renderer].zoomAndPan(zoom.k, [zoom.x, zoom.y]);
        });
        this[_renderer].zoomDrag.on("end", (a, b, e) => {
            let zoom = e[0].__zoom;
            let zoomPan = {"zoom": origin.zoom, "pan": origin.pan};
            this.command(
                () => { this[_renderer].zoomAndPan(zoom.k, [zoom.x, zoom.y]); },
                () => { this[_renderer].zoomAndPan(zoomPan.zoom, zoomPan.pan); }
            )
        });
    }
}
