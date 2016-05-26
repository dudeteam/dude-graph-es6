let _point = Symbol("point");
let _renderBlock = Symbol("renderBlock");
let _pointSize = Symbol("pointSize");
let _pointPosition = Symbol("pointPosition");

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
    get pointSize() { return this[_pointSize]; }
    /**
     * Sets the point size
     * @param {Array<number>} pointSize - the point size to set
     */
    set pointSize(pointSize) { this[_pointSize] = pointSize; }
    /**
     * Returns this render point position
     * @returns {Array<number>}
     */
    get pointPosition() { return this[_pointPosition]; }
    /**
     * Sets the point position
     * @param {Array<number>} pointPosition - the point position to set
     */
    set pointPosition(pointPosition) { this[_pointPosition] = pointPosition; }

    added() {}
    removed() {}

    move() {}
    update() {}

    connected() {}
    disconnected() {}

}
