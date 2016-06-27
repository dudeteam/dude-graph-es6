let _point = Symbol("point");
let _renderBlock = Symbol("renderBlock");
let _element = Symbol("element");
let _size = Symbol("size");
let _position = Symbol("position");

export default class RenderPoint {

    /**
     * Creates a render point for the specified point and the specified render block
     * @param {Point} point - specifies the point
     */
    constructor(point) {
        this[_point] = point;
        this[_renderBlock] = null;
        this[_element] = null;
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
     * @abstract
     */
    added() {}
    /**
     * Called when this render point is removed
     * @abstract
     */
    removed() {}

    /**
     * Called when this render point data changed and should update its element
     * @abstract
     */
    updateData() {}
    /**
     * Called when this render point position changed and should update its element
     * @abstract
     */
    updatePosition() {}

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
