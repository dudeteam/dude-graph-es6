import EventClass from "event-class-es6";

let _renderer = Symbol("renderer");
let _element = Symbol("element");
let _id = Symbol("id");
let _name = Symbol("name");
let _size = Symbol("size");
let _position = Symbol("position");

/**
 * Base class which represents any visual node within the renderer.
 */
export default class RenderNode extends EventClass {

    constructor() {
        super();

        this[_renderer] = null;
        this[_element] = null;
        this[_id] = null;
        this[_name] = null;
        this[_size] = [0, 0];
        this[_position] = [0, 0];
    }

    /**
     * Returns this render node fancy name
     * @returns {string}
     */
    get fancyName() { return this[_id]; }
    /**
     * Returns this render node renderer
     * @returns {Renderer}
     */
    get renderer() { return this[_renderer]; }
    /**
     * Sets this render node renderer
     * @param {Renderer} renderer - the renderer to set
     */
    set renderer(renderer) { this[_renderer] = renderer; }
    /**
     * Returns this render node d3 element
     * @returns {d3.selection}
     */
    get element() { return this[_element]; }
    /**
     * Sets this element
     * @param {d3.selection} element - the element to set
     */
    set element(element) { this[_element] = element; }
    /**
     * Returns this render node id
     * @returns {string}
     */
    get id() { return this[_id]; }
    /**
     * Sets this block id
     * @param {string} id - the node id to set
     */
    set id(id) { this[_id] = id; }
    /**
     * Returns this render node name
     * @returns {string}
     */
    get name() { return this[_name]; }
    /**
     * Sets this node name
     * @param {string} name - the node name to set
     */
    set name(name) { this[_name] = name; }
    /**
     * Returns this render node size
     * @returns {Array<number>}
     */
    get size() { return this[_size]; }
    /**
     * Sets the node size
     * @param {Array<number>} size - the node size to set
     */
    set size(size) { this[_size] = size; }
    /**
     * Returns this render node position
     * @returns {Array<number>}
     */
    get position() { return this[_position]; }
    /**
     * Sets the node position
     * @param {Array<number>} position - the node position to set
     */
    set position(position) { this[_position] = position; }

    /**
     * Called when the render node is added
     */
    added() {}
    /**
     * Called when the render node is removed
     */
    removed() {}

    /**
     * Called when the render node position changed and should move its element
     */
    move() {}
    /**
     * Called when the render node changed and should update the element
     */
    update() {}

    /**
     * Called when the render node has been selected
     */
    selected() {}
    /**
     * Called when the render node has been deselected
     */
    deselected() {}

    /**
     * Called when the render node should compute its size
     */
    computeSize() {}
    /**
     * Called when the render node should compute its position
     */
    computePosition() {}

}
