import RenderNode from "./node"

let _block = Symbol("block");
let _parent = Symbol("parent");

/**
 * Data used to visually represents a block into the Renderer. They can be several RenderBlock representation
 * for a given block.
 */
export default class RenderBlock extends RenderNode {

    /**
     * Creates a render block bound to the specified block
     * @param {Block} block - specifies the block
     */
    constructor(block) {
        super();

        this[_block] = block;
        this[_parent] = null;
    }

    /**
     * Returns this render block block
     * @returns {Block}
     */
    get block() { return this[_block]; }
    /**
     * Returns this render group render group parent
     * @returns {RenderGroup|null}
     */
    get parent() { return this[_parent]; }
    /**
     * Sets this render node renderer
     * @param {RenderGroup|null} parent - the block render group parent to set
     */
    set parent(parent) { this[_parent] = parent; }

    /**
     * Called when the render node is added
     * @override
     */
    added() {
        this.element.append("svg:rect");
        this.element.append("svg:text");
        this.element.append("svg:g");
    }
    /**
     * Called when the render node is removed
     * @override
     */
    removed() {

    }

}
