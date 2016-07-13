/*eslint no-unused-vars: "off"*/
import forEach from "lodash-es/forEach";
import forEachRight from "lodash-es/forEachRight";

import RenderBlock from "../renderer/nodes/block";
import RenderGroup from "../renderer/nodes/group";

const _renderer = Symbol("renderer");
const _transactions = Symbol("transactions");
const _undo = Symbol("undo");
const _redo = Symbol("redo");

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
     * Adds a command in the commander
     * @param {function} redo - the function to make/redo the command
     * @param {function} undo - the function to undo the command
     */
    command(redo, undo) {
        const action = {
            "undo": undo,
            "redo": redo
        };
        if (this[_transactions].length > 0) {
            const transaction = this[_transactions].slice(-1)[0];
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
        const undo = this[_undo].shift();
        if (typeof undo !== "undefined") {
            this[_redo].splice(0, 0, undo);
            undo.undo();
        }
    }
    /**
     * Redoes the last undone command
     */
    redo() {
        const redo = this[_redo].shift();
        if (typeof redo !== "undefined") {
            this[_undo].splice(0, 0, redo);
            redo.redo();
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
        const actions = this[_transactions].pop();
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

    /**
     * @see {Renderer.connect}
     * @param {RenderPoint} outputRenderPoint - @see {Renderer.connect}
     * @param {RenderPoint} inputRenderPoint - @see {Renderer.connect}
     */
    connectRenderPoints(outputRenderPoint, inputRenderPoint) {
        this.command(
            () => {
                const renderConnection = this[_renderer].connect(outputRenderPoint, inputRenderPoint);
                outputRenderPoint.updateData();
                inputRenderPoint.updateData();
                renderConnection.updatePosition();
            },
            () => {
                this[_renderer].disconnect(outputRenderPoint, inputRenderPoint);
                outputRenderPoint.updateData();
                inputRenderPoint.updateData();
            }
        );
    }
    /**
     * @see {Renderer.disconnect}
     * @param {RenderPoint} outputRenderPoint - @see {Renderer.disconnect}
     * @param {RenderPoint} inputRenderPoint - @see {Renderer.disconnect}
     */
    disconnectRenderPoints(outputRenderPoint, inputRenderPoint) {
        this.command(
            () => {
                this[_renderer].disconnect(outputRenderPoint, inputRenderPoint);
                outputRenderPoint.updateData();
                inputRenderPoint.updateData();
            },
            () => {
                const renderConnection = this[_renderer].connect(outputRenderPoint, inputRenderPoint);
                outputRenderPoint.updateData();
                inputRenderPoint.updateData();
                renderConnection.updatePosition();
            }
        );
    }

    /**
     * @see {RenderBlock.addRenderPoint}
     * @param {RenderBlock} renderBlock - @see {RenderBlock.addRenderPoint}
     * @param {RenderPoint} renderPoint - @see {RenderBlock.addRenderPoint}
     */
    addRenderBlockRenderPoint(renderBlock, renderPoint) {
        this.command(
            () => {
                renderBlock.addRenderPoint(renderPoint);
                renderPoint.updateAll();
                renderBlock.updateSize();
                forEach(renderBlock.renderPoints, rp => rp.updatePosition());
            },
            () => { renderBlock.removeRenderPoint(renderPoint); renderBlock.updateSize(); }
        );
    }
    /**
     * @see {RenderBlock.removeRenderPoint}
     * @param {RenderBlock} renderBlock - @see {RenderBlock.removeRenderPoint}
     * @param {RenderPoint} renderPoint - @see {RenderBlock.removeRenderPoint}
     */
    removeRenderBlockRenderPoint(renderBlock, renderPoint) {
        this.command(
            () => { renderBlock.removeRenderPoint(renderPoint); renderBlock.updateSize(); },
            () => {
                renderBlock.addRenderPoint(renderPoint);
                renderPoint.updateAll();
                renderBlock.updateSize();
                forEach(renderBlock.renderPoints, rp => rp.updatePosition());
            }
        );
    }

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
     * Changes the specified render node position to the specified position from the specified oldPosition
     * @param {RenderNode} renderNode - specifies the render node
     * @param {Array<number>} position - specifies the position
     * @param {Array<number>} [oldPosition=renderNode.position] - specifies the old position
     */
    changeRenderNodePosition(renderNode, position, oldPosition) {
        if (typeof oldPosition === "undefined") {
            oldPosition = renderNode.position.slice(0);
        }
        this.command(
            () => {
                renderNode.position = position.slice(0);
                renderNode.updatePosition();
                if (renderNode instanceof RenderBlock && renderNode.parent !== null) {
                    renderNode.parent.updatePosition();
                    renderNode.parent.updateSize();
                }
            },
            () => {
                renderNode.position = oldPosition.slice(0);
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
        const oldName = renderNode.name;
        this.command(
            () => { renderNode.name = name; renderNode.updateAll(); },
            () => { renderNode.name = oldName; renderNode.updateAll(); }
        );
    }

}
