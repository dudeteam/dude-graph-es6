import {textBoundingBox} from "../utils/measure";

const _point = Symbol("point");
const _renderBlock = Symbol("renderBlock");
const _renderConnections = Symbol("renderConnections");
const _element = Symbol("element");
const _size = Symbol("size");
const _position = Symbol("position");
const _svgCircle = Symbol("svgCircle");
const _svgName = Symbol("svgName");

export default class RenderPoint {

    /**
     * Creates a render point for the specified point and the specified render block
     * @param {Point} point - specifies the point
     */
    constructor(point) {
        this[_point] = point;
        this[_renderBlock] = null;
        this[_renderConnections] = [];
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
     * Returns this render point render connections
     * @returns {RenderConnection}
     */
    get renderConnections() { return this[_renderConnections]; }
    /**
     * Returns this render point wrapped element
     * @returns {HTMLWrapper}
     */
    get element() { return this[_element]; }
    /**
     * Sets this render point element to the specified wrapped element
     * @param {HTMLWrapper} element - specifies the wrapped element
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
     * Returns this render point absolute position
     * @returns {Array<number>}
     */
    get absolutePosition() {
        return [
            this.renderBlock.position[0] + this.position[0],
            this.renderBlock.position[1] + this.position[1]
        ];
    }
    /**
     * Returns whether this render point is empty
     * @returns {boolean}
     */
    get empty() { return this.renderConnections.length === 0 && this.point.emptyValue(); }

    /**
     * Adds the specified render connection to this render point
     * @param {RenderConnection} renderConnection - specifies the render connection
     */
    addRenderConnection(renderConnection) {
        this.renderConnections.push(renderConnection);
    }
    /**
     * Removes the specified render connection from this render point
     * @param {RenderConnection} renderConnection - specifies the render connection
     */
    removeRenderConnection(renderConnection) {
        this.renderConnections.splice(this.renderConnections.indexOf(renderConnection), 1);
    }

    /**
     * Called when this render point is added
     */
    added() {
        const r = this.renderBlock.renderer.config.point.radius;

        this[_svgCircle] = this.element.append("svg:path").classed("dude-graph-point-circle");
        this[_svgName] = this.element.append("svg:text").classed("dude-graph-point-name");

        this[_svgCircle].attr("d", () => {
            if (this.point.valueType === "stream") {
                return "M " + -r + " " + -r * 1.5 + " L " + -r + " " + r * 1.5 + " L " + r + " " + 0 + " Z";
            }
            return "M 0,0m " + -r + ", 0a " + [r, r] + " 0 1,0 " + r * 2 + ",0a " + [r, r] + " 0 1,0 " + -(r * 2) + ",0";
        });
        this[_svgName].attr("text-anchor", this.point.input ? "start" : "end");
        this[_svgName].attr("dominant-baseline", "middle");
        this[_svgName].attr("x", (this.point.input ? 1 : -1) * this.renderBlock.renderer.config.point.padding);
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
        this.element.attr("class", "dude-graph-point dude-graph-type-" + this.point.valueType);
        this.element.classed("dude-graph-point-empty", this.empty);
        this[_svgName].text(this.point.name);
    }
    /**
     * Called when this render point position changed and should update its element
     */
    updatePosition() {
        this.position = this.preferredPosition();

        this.element.attr("transform", "translate(" + this.position + ")");
    }
    /**
     * Called when this render point size changed and should update its element
     */
    updateSize() {
        this.size = this.preferredSize();
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

    /**
     * Returns the preferred size of this render point
     * @returns {Array<number>}
     */
    preferredSize() {
        const nameBoundingBox = textBoundingBox(this.point.name);
        return [
            nameBoundingBox[0] + this.renderBlock.renderer.config.point.padding * 2,
            this.renderBlock.renderer.config.point.height
        ];
    }

    /**
     * Returns the preferred position of this render point
     * @returns {Array<number>}
     */
    preferredPosition() {
        if (this.point.input) {
            const index = this.renderBlock.renderInputPoints.indexOf(this);
            return [
                this.renderBlock.renderer.config.point.padding,
                this.renderBlock.renderer.config.block.header + this.renderBlock.renderer.config.point.height * index
            ];
        } else {
            const index = this.renderBlock.renderOutputPoints.indexOf(this);
            return [
                this.renderBlock.size[0] - this.renderBlock.renderer.config.point.padding,
                this.renderBlock.renderer.config.block.header + this.renderBlock.renderer.config.point.height * index
            ];
        }
    }

}
