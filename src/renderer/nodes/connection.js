const _renderer = Symbol("renderer");
const _element = Symbol("element");
const _connection = Symbol("connection");
const _inputRenderPoint = Symbol("inputRenderPoint");
const _outputRenderPoint = Symbol("outputRenderPoint");

export default class RenderConnection {

    /**
     * Creates a render connection for the specified connection, between the specified outputRenderPoint and inputRenderPoint
     * @param {Connection} connection - specifies the connection
     * @param {RenderPoint} inputRenderPoint - specifies the input render point
     * @param {RenderPoint} outputRenderPoint - specifies the output render point
     */
    constructor(connection, inputRenderPoint, outputRenderPoint) {
        this[_renderer] = null;
        this[_element] = null;
        this[_connection] = connection;
        this[_inputRenderPoint] = inputRenderPoint;
        this[_outputRenderPoint] = outputRenderPoint;
        if (connection.inputPoint !== inputRenderPoint.point) {
            throw new Error(connection.fancyName + " is not connected to " + inputRenderPoint.point.fancyName);
        }
        if (connection.outputPoint !== outputRenderPoint.point) {
            throw new Error(connection.fancyName + " is not connected to " + outputRenderPoint.point.fancyName);
        }
    }

    /**
     * Returns this render connection fancy name
     * @returns {string}
     */
    get fancyName() { return this[_connection].fancyName; }
    /**
     * Returns this render connection renderer
     * @returns {Renderer}
     */
    get renderer() { return this[_renderer]; }
    /**
     * Sets this render connection renderer to the specified renderer
     * @param {Renderer} renderer - specifies the renderer
     */
    set renderer(renderer) { this[_renderer] = renderer; }
    /**
     * Returns this render connection wrapped element
     * @returns {HTMLWrapper}
     */
    get element() { return this[_element]; }
    /**
     * Sets this render connection element to the specified wrapped element
     * @param {HTMLWrapper} element - specifies the wrapped element
     */
    set element(element) { this[_element] = element; }
    /**
     * Returns this render connection connection
     * @returns {Connection}
     */
    get connection() { return this[_connection]; }
    /**
     * Returns this render connection inputRenderPoint
     * @returns {RenderPoint}
     */
    get inputRenderPoint() { return this[_inputRenderPoint]; }
    /**
     * Returns this render connection outputRenderPoint
     * @returns {RenderPoint}
     */
    get outputRenderPoint() { return this[_outputRenderPoint]; }

    /**
     * Called when this render connection is added
     */
    added() {}
    /**
     * Called when this render connection is removed
     */
    removed() {}

    /**
     * Called when this render connection should be updated
     */
    updateAll() {
        this.updateData();
        this.updatePosition();
    }

    /**
     * Called when this render connection data changed and should update its element
     */
    updateData() {
        this.element.attr("class", "dude-graph-connection dude-graph-type-" + this.outputRenderPoint.point.valueType);
    }

    /**
     * Called when this render connection position changed and should update its element
     */
    updatePosition() {
        this.element.attr("d", RenderConnection.connectionPath(this[_renderer], this[_outputRenderPoint].absolutePosition, this[_inputRenderPoint].absolutePosition));
    }

    /**
     * Returns the corresponding render point connected to the specified render point
     * @param {RenderPoint} renderPoint - specifies the render point
     * @returns {RenderPoint}
     */
    other(renderPoint) {
        if (renderPoint === this.inputRenderPoint) {
            return this.outputRenderPoint;
        } else if (renderPoint === this.outputRenderPoint) {
            return this.inputRenderPoint;
        }
        throw new Error(this.fancyName + " has no render point " + renderPoint.fancyName);
    }

    /**
     * Returns the preferred path between the specified output position and the specified input position
     * @param {Renderer} renderer - specifies the renderer
     * @param {Array<number>} from - specifies the output position
     * @param {Array<number>} to - specifies the input position
     * @returns {string}
     */
    static connectionPath(renderer, from, to) {
        let step = renderer.config.connection.step;
        if (from[0] > to[0]) {
            step += Math.max(-renderer.config.connection.step, Math.min(from[0] - to[0], renderer.config.connection.step));
        }
        return `M${from[0]},${from[1]}C${from[0] + step},${from[1]} ${to[0] - step},${to[1]} ${to[0]},${to[1]}`;
    }

}
