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
