import RenderNode from "./node";
import {renderBlockPreferredSize} from "../utils/measure";

const _block = Symbol("block");
const _parent = Symbol("parent");
const _renderPoints = Symbol("renderPoints");
const _svgBackground = Symbol("svgRect1");
const _svgContent = Symbol("svgRect2");
const _svgName = Symbol("svgName");
const _svgPoints = Symbol("svgPoints");

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
    get renderOutputPoints() { return this[_renderPoints].filter(renderPoint => renderPoint.point.pointOutput); }
    /**
     * Returns this render block input render points
     * @returns {Array<RenderPoint>}
     */
    get renderInputPoints() { return this[_renderPoints].filter(renderPoint => !renderPoint.point.pointOutput); }

    /**
     * Adds the specified render point to this render block
     * @param {RenderPoint} renderPoint - specifies the render point
     */
    addRenderPoint(renderPoint) {
        if (this.renderer === null) {
            throw new Error(this.fancyName + " cannot add renderPoint when not bound to a renderer");
        }
        if (renderPoint.element !== null || this[_renderPoints].some(rp => rp.point === renderPoint.point)) {
            throw new Error(this.fancyName + " cannot redefine render point " + renderPoint.fancyName);
        }
        this[_renderPoints].push(renderPoint);
        renderPoint.renderBlock = this;
        renderPoint.element = this[_svgPoints].append("svg:g").classed("dude-graph-point", true);
        renderPoint.added();
        this.renderer.emit("render-point-add", this, renderPoint);
    }
    /**
     * Removes the specified render point from this render block
     * @param {RenderPoint} renderPoint - specifies the render point
     */
    removeRenderPoint(renderPoint) {
        if (this.renderer === null) {
            throw new Error(this.fancyName + " cannot remove renderPoint when not bound to a renderer");
        }
        if (renderPoint.element === null || !this[_renderPoints].includes(renderPoint)) {
            throw new Error(this.fancyName + " cannot redefine render point " + renderPoint.fancyName);
        }
        this[_renderPoints].splice(this[_renderPoints].indexOf(renderPoint), 1);
        renderPoint.removed();
        renderPoint.element.remove();
        renderPoint.element = null;
        renderPoint.renderBlock = null;
        this.renderer.emit("render-point-remove", this, renderPoint);
    }
    /**
     * Returns the corresponding output point for the specified render point name
     * @param {string} renderPointName - specifies the render point name
     * @returns {RenderPoint|null}
     */
    outputByName(renderPointName) {
        return this[_renderPoints].find(rp => rp.point.pointOutput && rp.point.pointName === renderPointName) || null;
    }
    /**
     * Returns the corresponding input point for the specified render point name
     * @param {string} renderPointName - specifies the render point name
     * @returns {RenderPoint|null}
     */
    inputByName(renderPointName) {
        return this[_renderPoints].find(rp => !rp.point.pointOutput && rp.point.pointName === renderPointName) || null;
    }

    /**
     * Called when this render block is added
     * @override
     */
    added() {
        this[_svgBackground] = this.element.append("svg:rect").classed("dude-graph-block-background");
        this[_svgContent] = this.element.append("svg:rect").classed("dude-graph-block-content");
        this[_svgName] = this.element.append("svg:text").classed("dude-graph-block-name");
        this[_svgPoints] = this.element.append("svg:g").classed("dude-graph-block-points");

        this[_svgBackground].attr("rx", this.renderer.config.block.borderRadius);
        this[_svgBackground].attr("ry", this.renderer.config.block.borderRadius);
        this[_svgName].attr("text-anchor", "middle");
        this[_svgName].attr("dominant-baseline", "text-before-edge");
    }

    /**
     * Called when this render block data changed and should update the element
     * @override
     */
    updateData() {
        this.element.attr("class", "dude-graph-block dude-graph-block-name-" + this[_block].blockName);
        this[_svgName].text(this.name);
    }
    /**
     * Called when this render block position changed and should update its element
     * @override
     */
    updatePosition() {
        this.element.attr("transform", "translate(" + this.position + ")");
        this.renderPoints.forEach(rp => rp.renderConnections.forEach(rc => rc.updatePosition()));
    }
    /**
     * Called when this render block size changed and should update its element
     * @override
     */
    updateSize() {
        this.size = renderBlockPreferredSize(this);

        this[_svgBackground].attr("x", -2);
        this[_svgBackground].attr("width", this.size[0] + 4);
        this[_svgBackground].attr("height", this.size[1] + 2);
        this[_svgContent].attr("y", this.renderer.config.block.header - 16);
        this[_svgContent].attr("width", this.size[0]);
        this[_svgContent].attr("height", this.size[1] - this.renderer.config.block.header + 16);
        this[_svgName].attr("x", this.size[0] / 2);
        this[_svgName].attr("y", this.renderer.config.block.padding);
    }
}
