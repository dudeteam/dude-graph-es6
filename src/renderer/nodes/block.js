import RenderNode from "./node";

let _block = Symbol("block");
let _parent = Symbol("parent");
let _renderPoints = Symbol("renderPoints");
let _svgRect = Symbol("svgRect");
let _svgName = Symbol("svgName");
let _svgPoints = Symbol("svgPoints");

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
     * Sets this render block parent to the specified render group
     * @param {RenderGroup|null} parent - specifies the render group
     */
    set parent(parent) { this[_parent] = parent; }
    /**
     * Returns this render block renderPoints
     * @returns {Array<RenderPoint>}
     */
    get renderPoints() { return this[_renderPoints]; }

    /**
     * Called when this render node is added
     * @override
     */
    added() {
        this[_svgRect] = this.element.append("svg:rect").classed("dude-graph-block-background", true);
        this[_svgName] = this.element.append("svg:text").classed("dude-graph-block-name", true);
        this[_svgPoints] = this.element.append("svg:g").classed("dude-graph-block-points", true);
    }

    /**
     * Called when this render block data changed and should update the element
     * @override
     */
    updateData() { this[_svgName].text(this.name); }
    /**
     * Called when this render block position changed and should update its element
     * @override
     */
    updatePosition() { this.element.attr("transform", "translate(" + this.position + ")"); }
}
