import Block from "../block";
import Point from "../point";

const _variable = Symbol("_variable");

export default class VariableBlock extends Block {

    /**
     * @param {Block.blockDataTypedef} blockData - the block configuration data
     */
    constructor(blockData) {
        super(blockData);

        this[_variable] = null;
    }

    /**
     * Called when the block is added to the graph
     * @override
     */
    added() {
        this[_variable] = this.graph.variableByName(this.name);
        if (this[_variable] === null) {
            this.graph.removeBlock(this);
            throw new Error(this.fancyName + " must be linked to a graph variable");
        }
        if (this[_variable].block !== null && this[_variable].block !== this) {
            this.graph.removeBlock(this);
            throw new Error(this[_variable].fancyName + " cannot redefine block");
        }
        this[_variable].block = this;
        this.addPoint(new Point(false, {"name": "value", "valueType": this[_variable].valueType, "value": this[_variable].value, "policy": ["VALUE", "MULTIPLE_CONNECTIONS"]}));
    }

    /**
     * Called when the block is removed from the graph
     * @override
     */
    removed () {
        this[_variable].block = null;
    }

}
