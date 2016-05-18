import Block from "../block";

let _graphVariable = Symbol("_graphVariable");

export default class VariableBlock extends Block {

    /**
     * @param {Block.blockDataTypedef} blockData - the block configuration data
     */
    constructor(blockData) {
        super(blockData);

        this[_graphVariable] = null;
    }

    /**
     * Called when the block is added to the graph
     * @override
     */
    added() {
        this[_graphVariable] = this.blockGraph.variableByName(this.blockName);
        if (this[_graphVariable] === null) {
            this.blockGraph.removeBlock(this);
            throw new Error("VariableBlock `" + this.fancyName + "` must be linked to a graph variable");
        }
        if (this[_graphVariable].variableBlock !== null && this[_graphVariable].variableBlock !== this) {
            this.blockGraph.removeBlock(this);
            throw new Error("`" + this[_graphVariable].fancyName + "` cannot redefine variableBlock");
        }
        this[_graphVariable].variableBlock = this;
    }

    /**
     * Called when the block is removed from the graph
     * @override
     */
    removed () {
        this[_graphVariable].variableBlock = null;
    }

}
