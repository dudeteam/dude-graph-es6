import RenderNode from "./node"

let _block = Symbol("block");

export default class RenderBlock extends RenderNode {

    /**
     * Creates a render block from the specified render block data
     * @param {RenderBlock.renderBlockDataTypedef} renderBlockData - specifies the render block data
     */
    constructor(renderBlockData) {
        super(renderBlockData);

        this[_block] = renderBlockData.block;
    }

}

/**
 * @typedef {RenderNode.renderNodeDataTypedef} RenderBlock.renderBlockDataTypedef
 * @property {Block} block
 */
