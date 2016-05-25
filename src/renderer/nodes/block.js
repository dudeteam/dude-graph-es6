import RenderNode from "./node"

let _block = Symbol("block");

/**
 * Data used to visually represents a block into the Renderer. They can be several RenderBlock representation
 * for a given block.
 */
export default class RenderBlock extends RenderNode {

    /**
     * Creates a render block from the specified render block data
     * @param {RenderBlock.renderBlockDataTypedef} renderBlockData - specifies the render block data
     */
    constructor(renderBlockData) {
        super(renderBlockData);

        this[_block] = renderBlockData.block;
    }

    /**
     * Returns the `Block` to which this `RenderBlock` is linked to.
     * @returns {Block}
     */
    get block() { return this[_block]; }

}

/**
 * @typedef {RenderNode.renderNodeDataTypedef} RenderBlock.renderBlockDataTypedef
 * @property {Block} block
 */
