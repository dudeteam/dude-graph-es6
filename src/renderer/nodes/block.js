import pull from "lodash-es/pull";
import some from "lodash-es/some";
import clone from "lodash-es/clone";
import filter from "lodash-es/filter";
import includes from "lodash-es/includes";
import {event, drag} from "d3";

import RenderNode from "./node";
import {sizeRenderBlock} from "../utils/measure";

let _block = Symbol("block");
let _parent = Symbol("parent");
let _renderPoints = Symbol("renderPoints");
let _svgRect = Symbol("svgRect");
let _svgName = Symbol("svgName");
let _svgPoints = Symbol("svgPoints");
let _behaviorDrag = Symbol("behaviorDrag");

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
        this[_behaviorDrag] = drag();
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
     * Adds the specified render point to this render block
     * @param {RenderPoint} renderPoint - specifies the render point
     */
    addRenderPoint(renderPoint) {
        if (this.renderer === null) {
            throw new Error("`" + this.fancyName + "` cannot add renderPoint when not bound to a renderer");
        }
        if (renderPoint.element !== null || some(this[_renderPoints], rp => rp.point === renderPoint.point)) {
            throw new Error("`" + this.fancyName + "` cannot redefine render point `" + renderPoint.fancyName + "`");
        }
        this[_renderPoints].push(renderPoint);
        renderPoint.renderBlock = this;
        renderPoint.element = this[_svgPoints].append("svg:g").classed("dude-graph-point", true);
        renderPoint.added();
    }
    /**
     * Removes the specified render point from this render block
     * @param {RenderPoint} renderPoint - specifies the render point
     */
    removeRenderPoint(renderPoint) {
        if (this.renderer === null) {
            throw new Error("`" + this.fancyName + "` cannot remove renderPoint when not bound to a renderer");
        }
        if (renderPoint.element === null || !includes(this[_renderPoints], renderPoint)) {
            throw new Error("`" + this.fancyName + "` cannot redefine render point `" + renderPoint.fancyName + "`");
        }
        pull(this[_renderPoints], renderPoint);
        renderPoint.removed();
        renderPoint.element.remove();
        renderPoint.element = null;
        renderPoint.renderBlock = null;
    }

    /**
     * Called when this render block is added
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

        this.handleDrag();
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

    /**
     * Handles drag
     */
    handleDrag() {
        let oldPosition = [0, 0];
        this.element.call(this[_behaviorDrag]);
        this[_behaviorDrag].on("start", () => {
            oldPosition = clone(this.position);
        });
        this[_behaviorDrag].on("drag", () => {
            this.position[0] += event.dx;
            this.position[1] += event.dy;
            this.updatePosition();
            if (this.parent !== null) {
                this.parent.updateSize();
                this.parent.updatePosition();
            }
        });
        this[_behaviorDrag].on("end", () => {
            // TODO: check is a render group can accept this render block
            this.renderer.emit("render-block-drop", this, this.position, oldPosition);
        });
    }
}
