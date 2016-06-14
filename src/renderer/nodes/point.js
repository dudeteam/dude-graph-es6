let _point = Symbol("point");
let _renderBlock = Symbol("renderBlock");
let _size = Symbol("size");
let _position = Symbol("position");

export default class RenderPoint {

    /**
     * Creates a render point for the specified point and the specified render block
     * @param {Point} point - specifies the point
     * @param {RenderBlock} renderBlock - specifies the render block
     */
    constructor(point, renderBlock) {
        this[_point] = point;
        this[_renderBlock] = renderBlock;
        if (point.pointOutput && renderBlock.block.outputByName(point.pointName) !== point) {
            throw new Error("` " + point.fancyName + "` is not a point of `" + renderBlock.block.fancyName + "`");
        } else if (!point.pointOutput && renderBlock.block.inputByName(point.pointName) !== point) {
            throw new Error("` " + point.fancyName + "` is not a point of `" + renderBlock.block.fancyName + "`");
        }
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
     * Returns this render point size
     * @returns {Array<number>}
     */
    get size() { return this[_size]; }
    /**
     * Sets the point size
     * @param {Array<number>} size - the point size to set
     */
    set size(size) { this[_size] = size; }
    /**
     * Returns this render point position
     * @returns {Array<number>}
     */
    get position() { return this[_position]; }
    /**
     * Sets the point position
     * @param {Array<number>} position - the point position to set
     */
    set position(position) { this[_position] = position; }

    /**
     * Called when the render point is added
     * @abstract
     */
    added() {}
    /**
     * Called when the render node is removed
     * @abstract
     */
    removed() {}

    /**
     * Called when the render point position changed and should move its element
     * @abstract
     */
    move() {}
    /**
     * Called when the render point changed and should update its element
     * @abstract
     */
    update() {}

    /**
     * Called when the render point is connected
     * @abstract
     */
    connected() {}
    /**
     * Called when the render point is disconnected
     * @abstract
     */
    disconnected() {}

}
