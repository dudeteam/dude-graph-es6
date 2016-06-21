import filter from "lodash-es/filter";

import RenderNode from "./node";
import {sizeRenderBlock} from "../utils/measure";

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
        this.name = block.blockName;
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
     * Returns this render block render points
     * @returns {Array<RenderPoint>}
     */
    get renderPoints() { return this[_renderPoints]; }
    /**
     * Returns this render block output render points
     * @returns {Array<RenderPoint>}
     */
    get renderOutputPoints() { return filter(this[_renderPoints], renderPoint => renderPoint.point.pointOutput); }
    /**
     * Returns this render block input render points
     * @returns {Array<RenderPoint>}
     */
    get renderInputPoints() { return filter(this[_renderPoints], renderPoint => !renderPoint.point.pointOutput); }

    /**
     * Called when this render node is added
     * @override
     */
    added() {
        this[_svgRect] = this.element.append("svg:rect").classed("dude-graph-block-background", true);
        this[_svgName] = this.element.append("svg:text").classed("dude-graph-block-name", true);
        this[_svgPoints] = this.element.append("svg:g").classed("dude-graph-block-points", true);

        this[_svgRect].attr("rx", this.renderer.config.block.borderRadius);
        this[_svgRect].attr("ry", this.renderer.config.block.borderRadius);

        this[_svgName].attr("text-anchor", "middle");
        this[_svgName].attr("dominant-baseline", "text-before-edge");
    }

    /**
     * Called when this render block data changed and should update the element
     * @override
     */
    updateData() {
        let color = this.renderer.config.blockColors[this.block.blockName] || this.renderer.config.blockColors.default;

        this[_svgRect].attr("fill", color);
        this[_svgName].text(this.name);
    }
    /**
     * Called when this render block position changed and should update its element
     * @override
     */
    updatePosition() { this.element.attr("transform", "translate(" + this.position + ")"); }
    /**
     * Called when this render block size changed and should update its element
     * @override
     */
    updateSize() {
        this.size = sizeRenderBlock(this);

        this[_svgRect].attr("width", this.size[0]);
        this[_svgRect].attr("height", this.size[1]);

        this[_svgName].attr("x", this.size[0] / 2);
        this[_svgName].attr("y", this.renderer.config.block.padding);
    }
}
