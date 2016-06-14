import RenderNode from "./node";

let _block = Symbol("block");
let _parent = Symbol("parent");
let _renderPoints = Symbol("renderPoints");

/**
 * Data used to visually represents a block into the Renderer. They can be several RenderBlock representation
 * for a given block.
 */
export default class RenderBlock extends RenderNode {

    /**
     * Creates a render block for the specified block
     * @param {Block} block - specifies the block
     */
    constructor(block) {
        super();

        this[_block] = block;
        this[_parent] = null;
        this[_renderPoints] = [];
    }

    /**
     * Returns this render block fancy name
     * @returns {string}
     */
    get fancyName() { return this[_block].fancyName; }
    /**
     * Returns this render block block
     * @returns {Block}
     */
    get block() { return this[_block]; }
    /**
     * Returns this render block render group parent
     * @returns {RenderGroup|null}
     */
    get parent() { return this[_parent]; }
    /**
     * Sets this render block parent
     * @param {RenderGroup|null} parent - the block render group parent to set
     */
    set parent(parent) { this[_parent] = parent; }
    /**
     * Returns this render block renderPoints
     * @returns {Array<RenderPoint>}
     */
    get renderPoints() { return this[_renderPoints]; }

    /**
     * Called when the render node is added
     * @override
     */
    added() {
        this.element.append("svg:rect").classed("dude-graph-block-background", true);
        this.element.append("svg:text").classed("dude-graph-block-title", true);
        this.element.append("svg:g").classed("dude-graph-block-points", true);
    }

    /**
     * Called when the render node position changed and should move its element
     * @override
     */
    move() { this.element.attr("transform", "translate(" + this.position + ")"); }
    /**
     * Called when the render node changed and should update the element
     * @override
     */
    update() { this.move(); }

    /**
     * Called when the render node should compute its size
     * @override
     */
    computeSize() {

    }

}
