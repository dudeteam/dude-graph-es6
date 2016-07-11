import pull from "lodash-es/pull";
import {drag, mouse} from "d3";

import {renderPointPreferredSize} from "../utils/measure";
import {renderPointPreferredPosition} from "../utils/measure";
import {renderConnectionPreferredPath} from "../utils/measure";

const _point = Symbol("point");
const _renderBlock = Symbol("renderBlock");
const _renderConnections = Symbol("renderConnections");
const _element = Symbol("element");
const _size = Symbol("size");
const _position = Symbol("position");
const _svgCircle = Symbol("svgCircle");
const _svgName = Symbol("svgName");
const _behaviorDrag = Symbol("behaviorDrag");

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
        this[_behaviorDrag] = drag();
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
    get empty() { return this[_renderConnections].length === 0 && this[_point].emptyValue(); }

    /**
     * Adds the specified render connection to this render point
     * @param {RenderConnection} renderConnection - specifies the render connection
     */
    addRenderConnection(renderConnection) {
        this[_renderConnections].push(renderConnection);
    }
    /**
     * Removes the specified render connection from this render point
     * @param {RenderConnection} renderConnection - specifies the render connection
     */
    removeRenderConnection(renderConnection) {
        pull(this[_renderConnections], renderConnection);
    }

    /**
     * Called when this render point is added
     */
    added() {
        const r = this.renderBlock.renderer.config.point.radius;

        this[_svgCircle] = this.element.append("svg:path");
        this[_svgName] = this.element.append("svg:text");

        this[_svgCircle].attr("d", () => {
            return "M 0,0m " + -r + ", 0a " + [r, r] + " 0 1,0 " + r * 2 + ",0a " + [r, r] + " 0 1,0 " + -(r * 2) + ",0";
        });
        this[_svgName].attr("text-anchor", this.point.pointOutput ? "end" : "start");
        this[_svgName].attr("dominant-baseline", "middle");
        this[_svgName].attr("x", (this.point.pointOutput ? -1 : 1) * this.renderBlock.renderer.config.point.padding);

        this._handleDrag();
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
        const pointColor = this.renderBlock.renderer.config.typeColors[this.point.pointValueType] || this.renderBlock.renderer.config.typeColors.default;
        this[_svgCircle].attr("stroke", pointColor);
        this[_svgCircle].attr("fill", this.empty ? "transparent" : pointColor);
        this[_svgName].text(this.point.pointName);
    }
    /**
     * Called when this render point position changed and should update its element
     */
    updatePosition() {
        this.position = renderPointPreferredPosition(this);

        this.element.attr("transform", "translate(" + this.position + ")");
    }
    /**
     * Called when this render point size changed and should update its element
     */
    updateSize() {
        this.size = renderPointPreferredSize(this);
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
     * Handles drag
     * @private
     */
    _handleDrag() {
        this.element.call(this[_behaviorDrag]);
        let path = null;
        this[_behaviorDrag].on("start", () => {
            const color = this[_renderBlock].renderer.config.typeColors[this[_point].pointValueType];
            path = this[_renderBlock].renderer.svgConnections.append("svg:path").attr("class", "dude-graph-connection dude-graph-connection-drag");
            path.attr("stroke", color || this[_renderBlock].renderer.config.typeColors.default);
            path.attr("stroke-linecap", "round");
            path.attr("stroke-dasharray", "5,5");
        });
        this[_behaviorDrag].on("drag", () => {
            const position = mouse(this[_renderBlock].renderer.svgRoot.node());
            if (this[_point].pointOutput) {
                path.attr("d", renderConnectionPreferredPath(this[_renderBlock].renderer, this.absolutePosition, position));
            } else {
                path.attr("d", renderConnectionPreferredPath(this[_renderBlock].renderer, position, this.absolutePosition));
            }
        });
        this[_behaviorDrag].on("end", () => {
            const position = mouse(this[_renderBlock].renderer.svgRoot.node());
            path.remove();
            path = null;
            this[_renderBlock].renderer.emit("render-connection-drop", this, position);
        });
    }

}
