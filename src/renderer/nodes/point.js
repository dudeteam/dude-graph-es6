import {sizeRenderPoint} from "../utils/measure";
import {positionRenderPoint} from "../utils/measure";

const _point = Symbol("point");
const _renderBlock = Symbol("renderBlock");
const _element = Symbol("element");
const _size = Symbol("size");
const _position = Symbol("position");
const _d3Circle = Symbol("d3Circle");
const _d3Name = Symbol("d3Name");

export default class RenderPoint {

    /**
     * Creates a render point for the specified point and the specified render block
     * @param {Point} point - specifies the point
     */
    constructor(point) {
        this[_point] = point;
        this[_renderBlock] = null;
        this[_element] = null;
        this[_size] = [0, 0];
        this[_position] = [0, 0];
    }

    /**
     * Returns this render block fancy name
     * @returns {string}
     */
    get fancyName() { return this[_point].fancyName; }
    /**
     * Returns this render point point
     * @returns {Point}
     */
    get point() { return this[_point]; }
    /**
     * Returns this render point render block
     * @returns {RenderBlock}
     */
    get renderBlock() { return this[_renderBlock]; }
    /**
     * Sets this render point element to the specified render block
     * @param {RenderBlock} renderBlock - specifies the render block
     */
    set renderBlock(renderBlock) { this[_renderBlock] = renderBlock; }
    /**
     * Returns this render point d3 element
     * @returns {select}
     */
    get element() { return this[_element]; }
    /**
     * Sets this render point element to the specified d3 element
     * @param {select} element - specifies the d3 element
     */
    set element(element) { this[_element] = element; }
    /**
     * Returns this render point size
     * @returns {Array<number>}
     */
    get size() { return this[_size]; }
    /**
     * Sets the point size to the specified size
     * @param {Array<number>} size - specifies the size
     */
    set size(size) { this[_size] = size; }
    /**
     * Returns this render point position
     * @returns {Array<number>}
     */
    get position() { return this[_position]; }
    /**
     * Sets the point position to the specified position
     * @param {Array<number>} position - specifies the position
     */
    set position(position) { this[_position] = position; }

    /**
     * Called when this render point is added
     */
    added() {
        const r = this.renderBlock.renderer.config.point.radius;

        this[_d3Circle] = this.element.append("svg:path");
        this[_d3Name] = this.element.append("svg:text");

        this[_d3Circle].attr("d", () => {
            return "M 0,0m " + -r + ", 0a " + [r, r] + " 0 1,0 " + r * 2 + ",0a " + [r, r] + " 0 1,0 " + -(r * 2) + ",0";
        });
        this[_d3Name].attr("text-anchor", this.point.pointOutput ? "end" : "start");
        this[_d3Name].attr("dominant-baseline", "middle");
        this[_d3Name].attr("x", (this.point.pointOutput ? -1 : 1) * this.renderBlock.renderer.config.point.padding);
    }
    /**
     * Called when this render point is removed
     */
    removed() {}

    /**
     * Called when this render point should be updated
     */
    updateAll() {
        this.updateData();
        this.updatePosition();
        this.updateSize();
    }
    /**
     * Called when this render point data changed and should update its element
     */
    updateData() {
        const empty = false;
        const pointColor = this.renderBlock.renderer.config.typeColors[this.point.pointValueType] || this.renderBlock.renderer.config.typeColors.default;
        this[_d3Circle].attr("stroke", pointColor);
        this[_d3Circle].attr("fill", empty ? "transparent" : pointColor);
        this[_d3Name].text(this.point.pointName);
    }
    /**
     * Called when this render point position changed and should update its element
     */
    updatePosition() {
        this.position = positionRenderPoint(this);

        this.element.attr("transform", "translate(" + this.position + ")");
    }
    /**
     * Called when this render point size changed and should update its element
     */
    updateSize() {
        this.size = sizeRenderPoint(this);
    }

    /**
     * Called when this render point is connected
     * @abstract
     */
    connected() {}
    /**
     * Called when this render point is disconnected
     * @abstract
     */
    disconnected() {}

}
