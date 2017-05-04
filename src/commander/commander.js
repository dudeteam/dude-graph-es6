/* */
import RenderBlock from "../renderer/nodes/block";
import RenderGroup from "../renderer/nodes/group";

const _graph = Symbol("graph");
const _renderer = Symbol("renderer");
const _transactions = Symbol("transactions");
const _undo = Symbol("undo");
const _redo = Symbol("redo");

/**
 * This class handles add the possible commands on the graph and renderer
 * All commands are undoable/redoable
 */
export default class Commander {

    /**
     * Creates a commander for the specified graph and the specified renderer
     * @param {Graph} graph - specifies the graph
     * @param {Renderer|null} renderer - specifies the renderer
     */
    constructor(graph, renderer) {
        this[_graph] = graph;
        this[_renderer] = renderer || null;
        this[_transactions] = [];
        this[_undo] = [];
        this[_redo] = [];
    }

    /**
     * Returns this commander graph
     * @returns {Graph}
     */
    get graph() { return this[_graph]; }
    /**
     * Returns this commander renderer
     * @returns {Renderer|null}
     */
    get renderer() { return this[_renderer]; }

    /**
     * Adds a command in the commander with the specified redo and undo functions
     * @param {function} redo - specifies the redo function
     * @param {function} undo - specifies the undo function
     * @param {string} label - specifies the command name
     */
    command(redo, undo, label = "command without label") {
        const command = {
            "redo": redo,
            "undo": undo,
            "label": label,
        };
        redo(); // exception safety: does not add a command if the redo fails
        if (this[_transactions].length > 0) {
            this[_transactions][this[_transactions].length - 1].push(command);
        } else {
            this[_undo].push(command);
            this[_redo] = [];
        }
    }
    /**
     * Undoes the last command
     */
    undo() {
        if (this[_transactions].length !== 0) {
            throw new Error("Cannot undo while the transaction is not committed or rolled back");
        }
        const command = this[_undo].pop();
        if (typeof command !== "undefined") {
            command.undo(); // exception safety: does not add a command if the undo fails
            this[_redo].push(command);
        } else {
            throw new Error("There is nothing to undo");
        }
    }
    /**
     * Returns whether there is a command left to undo
     * @returns {boolean}
     */
    canUndo() {
        return this[_undo].length > 0;
    }
    /**
     * Redoes the last undone command
     */
    redo() {
        if (this[_transactions].length !== 0) {
            throw new Error("Cannot redo while the transaction is not committed or rolled back");
        }
        const command = this[_redo].pop();
        if (typeof command !== "undefined") {
            command.redo(); // exception safety: does not add a command if the redo fails
            this[_undo].push(command);
        } else {
            throw new Error("There is nothing to redo");
        }
    }
    /**
     * Returns whether there is a command left to redo
     * @returns {boolean}
     */
    canRedo() {
        return this[_redo].length > 0;
    }
    /**
     * Starts a transaction of commands that will be grouped under a single command
     */
    transaction() {
        this[_transactions].push([]);
    }
    /**
     * Commits the latest transaction into a single command
     * @param {boolean} reverseUndo - reverse undo for ordered commands
     */
    commit(reverseUndo = false) {
        const transaction = this[_transactions].pop();
        if (typeof transaction === "undefined") {
            throw new Error("No transaction to commit");
        }
        if (transaction.length === 0) {
            return;
        }
        const command = {
            "redo": () => {
                for (const command of transaction) {
                    command.redo();
                }
            },
            "undo": !reverseUndo ?
                () => { for (let i = transaction.length - 1; i >= 0; i--) { transaction[i].undo(); } } :
                () => { for (const command of transaction) { command.undo(); }
            },
            "label": transaction.map(c => c.label),
        };
        if (this[_transactions].length > 0) {
            this[_transactions][this[_transactions].length - 1].push(command);
        } else {
            this[_undo].push(command);
        }
    }
    /**
     * Cancels the latest transaction
     */
    rollback() {
        const transaction = this[_transactions].pop();
        if (typeof transaction === "undefined") {
            throw new Error("No transaction to rollback");
        }
        for (let i = transaction.length - 1; i >= 0; i--) {
            transaction[i].undo();
        }
    }

    /**
     * Describes this commander undo and redo stacks
     */
    describe() {
        /*eslint-disable no-console */
        const logger = (label) => {
            if (typeof label === "string") {
                console.log(label);
            } else {
                console.group("Transaction");
                label.forEach(l => logger(l));
                console.groupEnd();
            }
        };
        console.group("Undo commands");
        this[_undo].forEach((u) => {
            logger(u.label);
        });
        console.groupEnd();
        console.group("Redo commands");
        this[_redo].forEach((r) => {
            logger(r.label);
        });
        console.groupEnd();
        /*eslint-enable no-console */
    }

    /**
     * @see {Graph.addBlock}
     * @param {Block} block - @see {Graph.addBlock}
     */
    addBlock(block) {
        this.transaction();
        try {
            for (const point of block.points) {
                this.removeBlockPoint(block, point);
            }
            this.command(
                () => { this[_graph].addBlock(block); },
                () => { this[_graph].removeBlock(block); },
                `addBlock ${block.name}`
            );
            this.commit();
        } catch (e) {
            this.rollback();
            throw e;
        }
    }
    /**
     * @see {Graph.removeBlock}
     * @param {Block} block - @see {Graph.removeBlock}
     */
    removeBlock(block) {
        this.transaction();
        try {
            for (let i = block.points.length - 1; i >= 0; i--) {
                this.removeBlockPoint(block, block.points[i]);
            }
            this.command(
                () => {
                    this[_graph].removeBlock(block);
                },
                () => {
                    this[_graph].addBlock(block);
                },
                `removeBlock ${block.name}`
            );
            this.commit();
        } catch (e) {
            this.rollback();
            throw e;
        }
    }
    /**
     * @see {Block.addPoint}
     * @param {Block} block - @see {Block.addPoint}
     * @param {Point} point - @see {Block.addPoint}
     * @param {number|undefined} position - @see {Block.addPoint}
     */
    addBlockPoint(block, point, position = undefined) {
        this.command(
            () => { block.addPoint(point, position); },
            () => { block.removePoint(point); },
            `addBlockPoint ${block.name} ${point.name}`
        );
    }
    /**
     * @see {Block.removePoint}
     * @param {Block} block - @see {Block.removePoint}
     * @param {Point} point - @see {Block.removePoint}
     */
    removeBlockPoint(block, point) {
        this.transaction();
        try {
            for (let i = point.connections.length - 1; i >= 0; i--) {
                const connection = point.connections[i];
                this.disconnectPoints(connection.inputPoint, connection.outputPoint);
            }
            this.command(
                () => {
                    block.removePoint(point);
                },
                () => {
                    block.addPoint(point);
                },
                `removeBlockPoint ${block.name} ${point.name}`
            );
            this.commit();
        } catch (e) {
            this.rollback();
            throw e;
        }
    }
    /**
     * @see {Graph.connect}
     * @param {Point} inputPoint - @see {Graph.connect}
     * @param {Point} outputPoint - @see {Graph.connect}
     */
    connectPoints(inputPoint, outputPoint) {
        this.command(
            () => { inputPoint.connect(outputPoint); },
            () => { inputPoint.disconnect(outputPoint); },
            `connectPoints ${inputPoint.name} => ${outputPoint.name}`
        );
    }
    /**
     * @see {Graph.disconnect}
     * @param {Point} inputPoint - @see {Graph.disconnect}
     * @param {Point} outputPoint - @see {Graph.disconnect}
     */
    disconnectPoints(inputPoint, outputPoint) {
        this.command(
            () => { inputPoint.disconnect(outputPoint); },
            () => { inputPoint.connect(outputPoint); },
            `disconnectPoints ${inputPoint.name} => ${outputPoint.name}`
        );
    }
    /**
     * @see {Point.changeName}
     * @param {Point} point - @see {Point.changeName}
     * @param {*|null} name - @see {Point.changeName}
     * @param {*|null} oldName - @see {Point.changeName}
     */
    changePointName(point, name, oldName = point.name) {
        this.command(
            () => {
                point.name = name;
                if (this[_renderer] !== null) {
                    const renderBlock = this[_renderer].renderBlockByBlock(point.block);
                    if (renderBlock !== null) {
                        renderBlock.updateSize();
                        renderBlock.renderPointByPoint(point).updateAll();
                        renderBlock.updateSize();
                        for (const renderPoint of renderBlock.renderPoints) {
                            renderPoint.updateSize();
                            renderPoint.updatePosition();
                            for (const renderConnection of renderPoint.renderConnections) {
                                renderConnection.updatePosition();
                            }
                        }
                        if (renderBlock.parent !== null) {
                            renderBlock.parent.updateSize();
                            renderBlock.parent.updatePosition();
                        }
                    }
                }
            },
            () => {
                point.name = oldName;
                if (this[_renderer] !== null) {
                    const renderBlock = this[_renderer].renderBlockByBlock(point.block);
                    if (renderBlock !== null) {
                        renderBlock.updateSize();
                        renderBlock.renderPointByPoint(point).updateAll();
                        renderBlock.updateSize();
                        for (const renderPoint of renderBlock.renderPoints) {
                            renderPoint.updateSize();
                            renderPoint.updatePosition();
                            for (const renderConnection of renderPoint.renderConnections) {
                                renderConnection.updatePosition();
                            }
                        }
                        if (renderBlock.parent !== null) {
                            renderBlock.parent.updateSize();
                            renderBlock.parent.updatePosition();
                        }
                    }
                }
            },
            `changePointName ${point.name} to ${name}, was ${oldName}`
        );
    }
    /**
     * @see {Point.changeValue}
     * @param {Point} point - @see {Point.changeValue}
     * @param {*|null} value - @see {Point.changeValue}
     * @param {*|null} oldValue - @see {Point.changeValue}
     */
    changePointValue(point, value, oldValue = point.value) {
        this.command(
            () => {
                point.value = value;
                if (this[_renderer] !== null) {
                    const renderBlock = this[_renderer].renderBlockByBlock(point.block);
                    renderBlock && renderBlock.renderPointByPoint(point).updateData();
                }
            },
            () => {
                point.value = oldValue;
                if (this[_renderer] !== null) {
                    const renderBlock = this[_renderer].renderBlockByBlock(point.block);
                    renderBlock && renderBlock.renderPointByPoint(point).updateData();
                }
            },
            `changePointValue ${point.name} to ${value}, was ${oldValue}`
        );
    }

    /**
     * @see {Renderer.addRenderBlock}
     * @param {RenderBlock} renderBlock - @see {Renderer.addRenderBlock}
     */
    addRenderBlock(renderBlock) {
        this.command(
            () => { this[_renderer].addRenderBlock(renderBlock); renderBlock.updateAll(); },
            () => { this[_renderer].removeRenderBlock(renderBlock); },
            `addRenderBlock ${renderBlock.fancyName}`
        );
    }
    /**
     * @see {Renderer.removeRenderBlock}
     * @param {RenderBlock} renderBlock - @see {Renderer.removeRenderBlock}
     * @param {boolean} removeBlock - whether to remove the render block's block
     */
    removeRenderBlock(renderBlock, removeBlock = false) {
        this.transaction();
        try {
            if (renderBlock.parent !== null) {
                this.removeRenderGroupRenderBlock(renderBlock.parent, renderBlock);
            }
            for (let i = renderBlock.renderPoints.length - 1; i >= 0; i--) {
                this.removeRenderBlockRenderPoint(renderBlock, renderBlock.renderPoints[i]);
            }
            this.command(
                () => { this[_renderer].removeRenderBlock(renderBlock); },
                () => { this[_renderer].addRenderBlock(renderBlock); renderBlock.updateAll(); },
                `removeRenderBlock ${renderBlock.fancyName}`
            );
            if (removeBlock) {
                this.removeBlock(renderBlock.block);
            }
            this.commit();
        } catch (e) {
            this.rollback();
            throw e;
        }
    }
    /**
     * @see {Renderer.connect}
     * @param {RenderPoint} inputRenderPoint - @see {Renderer.connect}
     * @param {RenderPoint} outputRenderPoint - @see {Renderer.connect}
     */
    connectRenderPoints(inputRenderPoint, outputRenderPoint) {
        this.command(
            () => {
                const renderConnection = this[_renderer].connect(inputRenderPoint, outputRenderPoint);
                inputRenderPoint.updateData();
                outputRenderPoint.updateData();
                renderConnection.updateAll();
            },
            () => {
                this[_renderer].disconnect(inputRenderPoint, outputRenderPoint);
                inputRenderPoint.updateData();
                outputRenderPoint.updateData();
            },
            `connectRenderPoints ${inputRenderPoint.fancyName} => ${outputRenderPoint.fancyName}`
        );
    }
    /**
     * @see {Renderer.disconnect}
     * @param {RenderPoint} inputRenderPoint - @see {Renderer.disconnect}
     * @param {RenderPoint} outputRenderPoint - @see {Renderer.disconnect}
     */
    disconnectRenderPoints(inputRenderPoint, outputRenderPoint) {
        this.command(
            () => {
                this[_renderer].disconnect(inputRenderPoint, outputRenderPoint);
                inputRenderPoint.updateData();
                outputRenderPoint.updateData();
            },
            () => {
                const renderConnection = this[_renderer].connect(inputRenderPoint, outputRenderPoint);
                outputRenderPoint.updateData();
                inputRenderPoint.updateData();
                renderConnection.updateAll();
            },
            `disconnectRenderPoints ${inputRenderPoint.fancyName} => ${outputRenderPoint.fancyName}`
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
                for (const otherRenderPoint of renderBlock.renderPoints) {
                    otherRenderPoint.updatePosition();
                    for (const renderConnection of otherRenderPoint.renderConnections) {
                        renderConnection.updatePosition();
                    }
                }
                if (renderBlock.parent !== null) {
                    renderBlock.parent.updatePosition();
                    renderBlock.parent.updateSize();
                }
            },
            () => {
                renderBlock.removeRenderPoint(renderPoint);
                renderBlock.updateSize();
                for (const otherRenderPoint of renderBlock.renderPoints) {
                    otherRenderPoint.updatePosition();
                    for (const renderConnection of otherRenderPoint.renderConnections) {
                        renderConnection.updatePosition();
                    }
                }
                if (renderBlock.parent !== null) {
                    renderBlock.parent.updatePosition();
                    renderBlock.parent.updateSize();
                }
            },
            `addRenderBlockRenderPoint ${renderBlock.fancyName} => ${renderPoint.fancyName}`
        );
    }
    /**
     * @see {RenderBlock.removeRenderPoint}
     * @param {RenderBlock} renderBlock - @see {RenderBlock.removeRenderPoint}
     * @param {RenderPoint} renderPoint - @see {RenderBlock.removeRenderPoint}
     */
    removeRenderBlockRenderPoint(renderBlock, renderPoint) {
        this.transaction();
        try {
            for (let i = renderPoint.renderConnections.length - 1; i >= 0; i--) {
                const renderConnection = renderPoint.renderConnections[i];
                this.disconnectRenderPoints(renderConnection.inputRenderPoint, renderConnection.outputRenderPoint);
            }
            this.command(
                () => {
                    renderBlock.removeRenderPoint(renderPoint);
                    renderBlock.updateSize();
                    for (const otherRenderPoint of renderBlock.renderPoints) {
                        otherRenderPoint.updatePosition();
                        for (const renderConnection of otherRenderPoint.renderConnections) {
                            renderConnection.updatePosition();
                        }
                    }
                    if (renderBlock.parent !== null) {
                        renderBlock.parent.updatePosition();
                        renderBlock.parent.updateSize();
                    }
                },
                () => {
                    renderBlock.addRenderPoint(renderPoint);
                    renderPoint.updateAll();
                    renderBlock.updateSize();
                    for (const otherRenderPoint of renderBlock.renderPoints) {
                        otherRenderPoint.updatePosition();
                        for (const renderConnection of otherRenderPoint.renderConnections) {
                            renderConnection.updatePosition();
                        }
                    }
                    if (renderBlock.parent !== null) {
                        renderBlock.parent.updatePosition();
                        renderBlock.parent.updateSize();
                    }
                },
                `removeRenderBlockRenderPoint ${renderBlock.fancyName} => ${renderPoint.fancyName}`
            );
            this.commit();
        } catch (e) {
            this.rollback();
            throw e;
        }
    }
    /**
     * @see {Renderer.addRenderGroup}
     * @param {RenderGroup} renderGroup - @see {Renderer.addRenderGroup}
     */
    addRenderGroup(renderGroup) {
        this.command(
            () => { this[_renderer].addRenderGroup(renderGroup); renderGroup.updateAll(); },
            () => { this[_renderer].removeRenderGroup(renderGroup); },
            `addRenderGroup ${renderGroup.fancyName}`
        );
    }
    /**
     * @see {Renderer.addRenderGroup}
     * @param {RenderGroup} renderGroup - @see {Renderer.addRenderGroup}
     */
    removeRenderGroup(renderGroup) {
        this.transaction();
        try {
            for (let i = renderGroup.renderBlocks.length - 1; i >= 0; i--) {
                this.removeRenderGroupRenderBlock(renderGroup, renderGroup.renderBlocks[i]);
            }
            this.command(
                () => { this[_renderer].removeRenderGroup(renderGroup); },
                () => { this[_renderer].addRenderGroup(renderGroup); renderGroup.updateAll(); },
                `removeRenderGroup ${renderGroup.fancyName}`
            );
            this.commit();
        } catch (e) {
            this.rollback();
            throw e;
        }
    }
    /**
     * @see {RenderGroup.addRenderBlock}
     * @param {RenderGroup} renderGroup - @see {RenderGroup.addRenderBlock}
     * @param {RenderBlock} renderBlock - @see {RenderGroup.addRenderBlock}
     */
    addRenderGroupRenderBlock(renderGroup, renderBlock) {
        this.command(
            () => { renderGroup.addRenderBlock(renderBlock); renderGroup.updateAll(); },
            () => { renderGroup.removeRenderBlock(renderBlock); renderGroup.updateAll(); },
            `addRenderGroupRenderBlock ${renderGroup.fancyName} => ${renderBlock.fancyName}`
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
            () => { renderGroup.addRenderBlock(renderBlock); renderGroup.updateAll(); },
            `removeRenderGroupRenderBlock ${renderGroup.fancyName} => ${renderBlock.fancyName}`
        );
    }
    /**
     * Changes the specified render node name to the specified name
     * @param {RenderNode} renderNode - specifies the render node
     * @param {string} name - specifies the name
     * @param {string} oldName - specifies the old name
     */
    changeRenderNodeName(renderNode, name, oldName = renderNode.name) {
        if (typeof oldName === "undefined") {
            oldName = renderNode.name;
        }
        if (name === oldName) {
            return;
        }
        this.command(
            () => {
                renderNode.name = name;
                renderNode.updateAll();
                if (renderNode instanceof RenderBlock) {
                    if (renderNode.parent !== null) {
                        renderNode.parent.updatePosition();
                        renderNode.parent.updateSize();
                    }
                    for (const renderPoint of renderNode.renderPoints) {
                        renderPoint.updatePosition();
                        renderPoint.updateSize();
                        for (const renderConnection of renderPoint.renderConnections) {
                            renderConnection.updatePosition();
                        }
                    }
                }
            },
            () => {
                renderNode.name = oldName;
                renderNode.updateAll();
                if (renderNode instanceof RenderBlock) {
                    if (renderNode.parent !== null) {
                        renderNode.parent.updatePosition();
                        renderNode.parent.updateSize();
                    }
                    for (const renderPoint of renderNode.renderPoints) {
                        renderPoint.updatePosition();
                        renderPoint.updateSize();
                        for (const renderConnection of renderPoint.renderConnections) {
                            renderConnection.updatePosition();
                        }
                    }
                }
            },
            `changeRenderNodeName ${renderNode.fancyName} => ${name}, was ${oldName}`
        );
    }
    /**
     * Changes the specified render node position to the specified position from the specified oldPosition
     * @param {RenderNode} renderNode - specifies the render node
     * @param {Array<number>} position - specifies the position
     * @param {Array<number>} oldPosition - specifies the old position
     */
    changeRenderNodePosition(renderNode, position, oldPosition = renderNode.position) {
        if (position[0] === oldPosition[0] && position[1] === oldPosition[1]) {
            return;
        }
        this.command(
            () => {
                if (renderNode instanceof RenderBlock) {
                    renderNode.position = position;
                    renderNode.updatePosition();
                    if (renderNode.parent !== null) {
                        renderNode.parent.updatePosition();
                        renderNode.parent.updateSize();
                    }
                } else if (renderNode instanceof RenderGroup) {
                    const diff = [position[0] - renderNode.position[0], position[1] - renderNode.position[1]];
                    for (const renderBlock of renderNode.renderBlocks) {
                        renderBlock.position[0] += diff[0];
                        renderBlock.position[1] += diff[1];
                        renderBlock.updatePosition();
                    }
                    renderNode.position = position;
                    renderNode.updatePosition();
                }
            },
            () => {
                if (renderNode instanceof RenderBlock) {
                    renderNode.position = oldPosition;
                    renderNode.updatePosition();
                    if (renderNode.parent !== null) {
                        renderNode.parent.updatePosition();
                        renderNode.parent.updateSize();
                    }
                } else if (renderNode instanceof RenderGroup) {
                    const diff = [oldPosition[0] - renderNode.position[0], oldPosition[1] - renderNode.position[1]];
                    for (const renderBlock of renderNode.renderBlocks) {
                        renderBlock.position[0] += diff[0];
                        renderBlock.position[1] += diff[1];
                        renderBlock.updatePosition();
                    }
                    renderNode.position = oldPosition;
                    renderNode.updatePosition();
                }
            },
            `changeRenderNodePosition ${renderNode.fancyName} => ${position}, was ${oldPosition}`
        );
    }
    /**
     * Changes the specified render group color to the specified color from the specified oldColor
     * @param {RenderGroup} renderGroup - specifies the render group
     * @param {string} color - specifies the color
     * @param {string} oldColor - specifies the old color
     */
    changeRenderGroupColor(renderGroup, color, oldColor = renderGroup.color) {
        this.command(
            () => { renderGroup.color = color; renderGroup.updateData(); },
            () => { renderGroup.color = oldColor; renderGroup.updateData(); },
            `changeRenderGroupColor ${renderGroup.fancyName} ${oldColor} => ${color}`
        );
    }

}
