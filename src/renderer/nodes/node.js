import EventClass from "event-class-es6";

let _renderer = Symbol("renderer");
let _element = Symbol("nodeElement");
let _nodeId = Symbol("nodeId");
let _nodeName = Symbol("nodeName");
let _nodeSize = Symbol("nodeSize");
let _nodePosition = Symbol("nodePosition");

/**
 * Base class which represents any visual node within the renderer.
 */
export default class RenderNode extends EventClass {

    constructor() {
        super();

        this[_renderer] = null;
        this[_element] = null;
        this[_nodeId] = null;
        this[_nodeName] = null;
        this[_nodeSize] = [0, 0];
        this[_nodePosition] = [0, 0];
    }

    /**
     * Returns this render node fancy name
     * @returns {string}
     */
    get fancyName() { return this[_nodeId]; }
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
    get nodeId() { return this[_nodeId]; }
    /**
     * Sets this block id
     * @param {string} nodeId - the node id to set
     */
    set nodeId(nodeId) { this[_nodeId] = nodeId; }
    /**
     * Returns this render node name
     * @returns {string}
     */
    get nodeName() { return this[_nodeName]; }
    /**
     * Sets this node name
     * @param {string} nodeName - the node name to set
     */
    set nodeName(nodeName) { this[_nodeName] = nodeName; }
    /**
     * Returns this render node size
     * @returns {Array<number>}
     */
    get nodeSize() { return this[_nodeSize]; }
    /**
     * Sets the node size
     * @param {Array<number>} nodeSize - the node size to set
     */
    set nodeSize(nodeSize) { this[_nodeSize] = nodeSize; }
    /**
     * Returns this render node position
     * @returns {Array<number>}
     */
    get nodePosition() { return this[_nodePosition]; }
    /**
     * Sets the node position
     * @param {Array<number>} nodePosition - the node position to set
     */
    set nodePosition(nodePosition) { this[_nodePosition] = nodePosition; }

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
