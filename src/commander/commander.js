import RenderBlock from "../renderer/nodes/block";
import RenderGroup from "../renderer/nodes/group";

const _graph = Symbol("graph");
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
     * Creates a commander for the specified graph and the specified renderer
     * @param {Graph} graph - specifies the graph
     * @param {Renderer} renderer - specifies the renderer
     */
    constructor(graph, renderer) {
        this[_graph] = graph;
        this[_renderer] = renderer;
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
     * @returns {Renderer}
     */
    get renderer() { return this[_renderer]; }

    /**
     * Adds a command in the commander with the specified redo and undo functions
     * @param {function} redo - specifies the redo function
     * @param {function} undo - specifies the undo function
     * @param {string} [label] - specifies the command name
     */
    command(redo, undo, label) {
        const command = {
            "redo": redo,
            "undo": undo,
            "label": label,
        };
        if (this[_transactions].length > 0) {
            this[_transactions][this[_transactions].length - 1].push(command);
        } else {
            this[_undo].push(command);
            this[_redo] = [];
        }
        redo();
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
            this[_redo].push(command);
            command.undo();
        }
    }
    /**
     * Redoes the last undone command
     */
    redo() {
        if (this[_transactions].length !== 0) {
            throw new Error("Cannot undo while the transaction is not committed or rolled back");
        }
        const command = this[_redo].pop();
        if (typeof command !== "undefined") {
            this[_undo].push(command);
            command.redo();
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
        const transaction = this[_transactions].pop();
        if (typeof transaction === "undefined") {
            throw new Error("No transaction to commit");
        }
        const command = {
            "redo": () => {
                for (const command of transaction) {
                    command.redo();
                }
            },
            "undo": () => {
                for (let i = transaction.length - 1; i >= 0; i--) {
                    transaction[i].undo();
                }
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
        for (const command of transaction) {
            command.undo();
        }
    }

    /**
     * Describes this commander undo and redo stacks
     */
    describe() {
        const undoes = this[_undo].map((u) => u.label);
        const redoes = this[_redo].map((r) => r.label);
        /*eslint-disable no-console */
        console.group("Undo commands");
        for (const undo of undoes) {
            if (typeof undo === "string") {
                console.log(undo);
            } else {
                console.group("Transaction");
                console.log(undo.slice(0).reverse().join("\n"));
                console.groupEnd();
            }
        }
        console.groupEnd();
        console.group("Redo commands");
        for (const redo of redoes) {
            if (typeof redo === "string") {
                console.log(redo);
            } else {
                console.group("Transaction");
                console.log(redo.join("\n"));
                console.groupEnd();
            }
        }
        console.groupEnd();
        /*eslint-enable no-console */
    }

    /**
     * @see {Graph.addBlock}
     * @param {Block} block - @see {Graph.addBlock}
     */
    addBlock(block) {
        this.transaction();
        {
            for (const point of block.points) {
                this.removeBlockPoint(block, point);
            }
            this.command(
                () => { this[_graph].addBlock(block); },
                () => { this[_graph].removeBlock(block); },
                `addBlock ${block.name}`
            );
        }
        this.commit();
    }
    /**
     * @see {Graph.removeBlock}
     * @param {Block} block - @see {Graph.removeBlock}
     */
    removeBlock(block) {
        this.transaction();
        {
            for (const point of block.points) {
                this.removeBlockPoint(block, point);
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
        }
        this.commit();
    }
    /**
     * @see {Block.addPoint}
     * @param {Block} block - @see {Block.addPoint}
     * @param {Point} point - @see {Block.addPoint}
     */
    addBlockPoint(block, point) {
        this.command(
            () => { block.addPoint(point); },
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
        {
            for (const connection of point.connections) {
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
        }
        this.commit();
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
     * @see {Point.changeValue}
     * @param {Point} point - @see {Point.changeValue}
     * @param {*|null} value - @see {Point.changeValue}
     * @param {*|null} [oldValue=point.value] - @see {Point.changeValue}
     */
    changePointValue(point, value, oldValue) {
        if (typeof oldValue === "undefined") {
            oldValue = point.value;
        }
        if (value === oldValue) {
            return;
        }
        this.command(
            () => {
                point.value = value;
                this[_renderer].renderPoints.filter(rp => rp.point === point).forEach(rp => rp.updateData());
            },
            () => {
                point.value = oldValue;
                this[_renderer].renderPoints.filter(rp => rp.point === point).forEach(rp => rp.updateData());
            },
            `changePointValue ${point.name} to ${value}, was ${oldValue}]`
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
     * @param {boolean} [removeBlock=false] - whether to remove the render block's block if it was the last referenced
     */
    removeRenderBlock(renderBlock, removeBlock) {
        this.transaction();
        {
            if (renderBlock.parent !== null) {
                this.removeRenderGroupRenderBlock(renderBlock.parent, renderBlock);
            }
            for (let i = renderBlock.renderPoints.length - 1; i >= 0; i--) {
                this.removeRenderBlockRenderPoint(renderBlock, renderBlock.renderPoints[i]);
            }
            if (removeBlock === true && this[_renderer].renderBlocksByBlock(renderBlock.block).length === 0) {
                this.removeBlock(renderBlock.block);
            }
            this.command(
                () => { this[_renderer].removeRenderBlock(renderBlock); },
                () => { this[_renderer].addRenderBlock(renderBlock); renderBlock.updateAll(); },
                `removeRenderBlock ${renderBlock.fancyName}`
            );
        }
        this.commit();
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
                }
            },
            () => { renderBlock.removeRenderPoint(renderPoint); renderBlock.updateSize(); },
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
        {
            for (const renderConnection of renderPoint.renderConnections) {
                this.disconnectRenderPoints(renderConnection.inputRenderPoint, renderConnection.outputRenderPoint);
            }
            this.command(
                () => {
                    renderBlock.removeRenderPoint(renderPoint);
                    renderBlock.updateSize();
                },
                () => {
                    renderBlock.addRenderPoint(renderPoint);
                    renderPoint.updateAll();
                    renderBlock.updateSize();
                    for (const otherRenderPoint of renderBlock.renderPoints) {
                        otherRenderPoint.updatePosition();
                    }
                },
                `removeRenderBlockRenderPoint ${renderBlock.fancyName} => ${renderPoint.fancyName}`
            );
        }
        this.commit();
    }
    /**
     * @see {Renderer.addRenderGroup}
     * @param {RenderGroup} renderGroup - @see {Renderer.addRenderGroup}
     * @returns {RenderGroup}
     */
    addRenderGroup(renderGroup) {
        return this.command(
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
        {
            for (const renderBlock of renderGroup.renderBlocks) {
                this.removeRenderGroupRenderBlock(renderGroup, renderBlock);
            }
            this.command(
                () => { this[_renderer].removeRenderGroup(renderGroup); },
                () => { this[_renderer].addRenderGroup(renderGroup); renderGroup.updateAll(); },
                `removeRenderGroup ${renderGroup.fancyName}`
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
     * @param {string} [oldName=renderNode.name] - specifies the old name
     */
    changeRenderNodeName(renderNode, name, oldName) {
        if (typeof oldName === "undefined") {
            oldName = renderNode.name;
        }
        if (name === oldName) {
            return;
        }
        this.command(
            () => { renderNode.name = name; renderNode.updateAll(); },
            () => { renderNode.name = oldName; renderNode.updateAll(); },
            `changeRenderNodeName ${renderNode.fancyName} => ${name}, was ${oldName}`
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

}
