import EventClass from "event-class-es6";

const _renderer = Symbol("renderer");
const _element = Symbol("element");
const _id = Symbol("id");
const _name = Symbol("name");
const _size = Symbol("size");
const _position = Symbol("position");

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
     * Sets this render node renderer to the specified renderer
     * @param {Renderer} renderer - specifies the renderer
     */
    set renderer(renderer) { this[_renderer] = renderer; }
    /**
     * Returns this render node wrapped element
     * @returns {HTMLWrapper}
     */
    get element() { return this[_element]; }
    /**
     * Sets this render node element to the specified wrapped element
     * @param {HTMLWrapper} element - specifies the wrapped element
     */
    set element(element) { this[_element] = element; }
    /**
     * Returns this render node id
     * @returns {string|null}
     */
    get id() { return this[_id]; }
    /**
     * Sets this render node id to the specified id
     * @param {string|null} id - specifies the id
     */
    set id(id) { this[_id] = id; }
    /**
     * Returns this render node name
     * @returns {string|null}
     */
    get name() { return this[_name]; }
    /**
     * Sets this node name to the specified name
     * @param {string|null} name - specifies the name
     */
    set name(name) { this[_name] = name; }
    /**
     * Returns this render node size
     * @returns {Array<number>}
     */
    get size() { return this[_size]; }
    /**
     * Sets this node size to the specified size
     * @param {Array<number>} size - specifies the size
     */
    set size(size) { this[_size] = size; }
    /**
     * Returns this render node position
     * @returns {Array<number>}
     */
    get position() { return this[_position]; }
    /**
     * Sets this node position to the specified position
     * @param {Array<number>} position - specifies the position
     */
    set position(position) { this[_position] = position; }

    /**
     * Called when this render node is added
     * @abstract
     */
    added() {}
    /**
     * Called when this render node is removed
     * @abstract
     */
    removed() {}

    /**
     * Called when this render node should be updated
     */
    updateAll() {
        this.updateData();
        this.updatePosition();
        this.updateSize();
    }
    /**
     * Called when this render node data changed and should update the element
     * @abstract
     */
    updateData() {}
    /**
     * Called when this render node size changed and should update its element
     * @abstract
     */
    updateSize() {}
    /**
     * Called when this render node position changed and should update its element
     * @abstract
     */
    updatePosition() {}

    /**
     * Brings this render node to the front
     */
    front() {
        this.element.element.parentElement.appendChild(this.element.element);
    }

}
