import RenderNode from "./node";
import {textBoundingBox} from "../utils/measure";

const _block = Symbol("block");
const _parent = Symbol("parent");
const _renderPoints = Symbol("renderPoints");
const _svgBackground = Symbol("svgBackground");
const _svgContent = Symbol("svgContent");
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
    }

    /**
     * Returns this render block fancy name
     * @returns {string}
     */
    get fancyName() { return this[_block].fancyName; }

    /**
     * Returns this render block id
     * @returns {string}
     */
    get id() { return this[_block].id; }
    /**
     * Returns this render block name
     * @returns {string|null}
     * @override
     */
    get name() { return this[_block].name; }
    /**
     * Sets this render block name to the specified name
     * @param {string|null} name - specifies the name
     * @override
     */
    set name(name) { this[_block].name = name; }
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
     * Returns this render block input render points
     * @returns {Array<RenderPoint>}
     */
    get renderInputPoints() { return this.renderPoints.filter(renderPoint => renderPoint.point.input); }
    /**
     * Returns this render block output render points
     * @returns {Array<RenderPoint>}
     */
    get renderOutputPoints() { return this.renderPoints.filter(renderPoint => renderPoint.point.output); }

    /**
     * Adds the specified render point to this render block
     * @param {RenderPoint} renderPoint - specifies the render point
     */
    addRenderPoint(renderPoint) {
        if (this.renderer === null) {
            throw new Error(this.fancyName + " cannot add renderPoint when not bound to a renderer");
        }
        if (renderPoint.point.block !== this.block) {
            throw new Error(this.fancyName + " has no point " + renderPoint.fancyName);
        }
        if (renderPoint.element !== null || this.renderPoints.some(rp => rp.point === renderPoint.point)) {
            throw new Error(this.fancyName + " cannot redefine render point " + renderPoint.fancyName);
        }
        const offset = renderPoint.point.input ? 0 : this[_renderPoints].length;
        this.renderPoints.splice(offset + renderPoint.point.position, 0, renderPoint);
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
        if (renderPoint.element === null || !this.renderPoints.includes(renderPoint)) {
            throw new Error(this.fancyName + " cannot redefine render point " + renderPoint.fancyName);
        }
        this[_renderPoints].splice(this.renderPoints.indexOf(renderPoint), 1);
        renderPoint.removed();
        renderPoint.element.remove();
        renderPoint.element = null;
        renderPoint.renderBlock = null;
        this.renderer.emit("render-point-remove", this, renderPoint);
    }
    /**
     * Returns the render point corresponding to the specified point
     * @param {Point} point - specifies the point
     * @returns {RenderPoint|null}
     */
    renderPointByPoint(point) {
        return this.renderPoints.find(rp => rp.point === point) || null;
    }
    /**
     * Returns the corresponding render point for the specified input and render point name
     * @param {boolean} input - specifies if the render point is an input
     * @param {string} pointName - specifies the render point name
     * @returns {RenderPoint|null}
     */
    pointBy(input, pointName) {
        return input ? this.inputByName(pointName) : this.outputByName(pointName);
    }
    /**
     * Returns the corresponding render input point for the specified render point name
     * @param {string} pointName - specifies the render point name
     * @returns {RenderPoint|null}
     */
    inputByName(pointName) {
        return this.renderPoints.find(rp => rp.point.input && rp.point.name === pointName) || null;
    }
    /**
     * Returns the corresponding render output point for the specified render point name
     * @param {string} pointName - specifies the render point name
     * @returns {RenderPoint|null}
     */
    outputByName(pointName) {
        return this.renderPoints.find(rp => rp.point.output && rp.point.name === pointName) || null;
    }

    /**
     * Called when this render block should create the group for the render points
     */
    attached() {
        this[_svgPoints] = this.element.append("svg:g").classed("dude-graph-block-points");
    }

    /**
     * Called when this render block is added
     * @override
     */
    added() {
        this[_svgName] = this.element.prepend("svg:text").classed("dude-graph-block-name");
        this[_svgContent] = this.element.prepend("svg:rect").classed("dude-graph-block-content");
        this[_svgBackground] = this.element.prepend("svg:rect").classed("dude-graph-block-background");

        this[_svgName].attr("text-anchor", "middle");
        this[_svgName].attr("dominant-baseline", "text-before-edge");
        this[_svgBackground].attr("rx", this.renderer.config.block.borderRadius);
        this[_svgBackground].attr("ry", this.renderer.config.block.borderRadius);
    }

    /**
     * Called when this render block is removed
     * @override
     */
    removed() {

    }

    /**
     * Called when this render block data changed and should update the element
     * @override
     */
    updateData() {
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
        this.size = this.preferredSize();

        this[_svgBackground].attr("x", -2);
        this[_svgBackground].attr("width", this.size[0] + 4);
        this[_svgBackground].attr("height", this.size[1] + 2);
        this[_svgContent].attr("y", this.renderer.config.block.header - 16);
        this[_svgContent].attr("width", this.size[0]);
        this[_svgContent].attr("height", this.size[1] - this.renderer.config.block.header + 16);
        this[_svgName].attr("x", this.size[0] / 2);
        this[_svgName].attr("y", this.renderer.config.block.padding);
    }

    /**
     * Returns the preferred size of this render block
     * @returns {Array<number>}
     */
    preferredSize() {
        const irp = this.renderInputPoints;
        const orp = this.renderOutputPoints;
        const inputWidth = irp.reduce((a, rp) => a > rp.size[0] ? a : rp.size[0], 0);
        const outputWidth = orp.reduce((a, rp) => a > rp.size[0] ? a : rp.size[0], 0);
        const pointsHeight = (irp.length >= orp.length ? irp : orp).reduce((a, rp) => a + rp.size[1], 0);
        return [Math.max(textBoundingBox(this.name || "")[0] + this.renderer.config.block.padding * 2, inputWidth + outputWidth + this.renderer.config.block.pointSpacing), pointsHeight + this.renderer.config.block.header];
    }

}
