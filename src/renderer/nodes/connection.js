const _renderer = Symbol("renderer");
const _element = Symbol("element");
const _connection = Symbol("connection");
const _outputRenderPoint = Symbol("outputRenderPoint");
const _inputRenderPoint = Symbol("inputRenderPoint");

export default class RenderConnection {

    /**
     * Creates a render connection for the specified connection, between the specified outputRenderPoint and inputRenderPoint
     * @param {Connection} connection - specifies the connection
     * @param {RenderPoint} outputRenderPoint - specifies the output render point
     * @param {RenderPoint} inputRenderPoint - specifies the input render point
     */
    constructor(connection, outputRenderPoint, inputRenderPoint) {
        this[_renderer] = null;
        this[_element] = null;
        this[_connection] = connection;
        this[_outputRenderPoint] = outputRenderPoint;
        this[_inputRenderPoint] = inputRenderPoint;
        if (connection.connectionOutputPoint !== outputRenderPoint.point) {
            throw new Error("`" + connection.fancyName + "` is not connected to `" + outputRenderPoint.point.fancyName + "`");
        }
        if (connection.connectionInputPoint !== inputRenderPoint.point) {
            throw new Error("`" + connection.fancyName + "` is not connected to `" + inputRenderPoint.point.fancyName + "`");
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
     * Returns this render connection d3 element
     * @returns {select}
     */
    get element() { return this[_element]; }
    /**
     * Sets this render connection element to the specified d3 element
     * @param {select} element - specifies the d3 element
     */
    set element(element) { this[_element] = element; }
    /**
     * Returns this render connection connection
     * @returns {Connection}
     */
    get connection() { return this[_connection]; }
    /**
     * Returns this render connection outputRenderPoint
     * @returns {Connection}
     */
    get outputRenderPoint() { return this[_outputRenderPoint]; }
    /**
     * Returns this render connection inputRenderPoint
     * @returns {Connection}
     */
    get inputRenderPoint() { return this[_inputRenderPoint]; }

}
