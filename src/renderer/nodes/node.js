import EventClass from "event-class-es6";

let _renderer = Symbol("renderer");
let _nodeId = Symbol("nodeId");
let _nodeName = Symbol("nodeName");
let _nodeSize = Symbol("nodeSize");
let _nodePosition = Symbol("nodePosition");
let _nodeElement = Symbol("nodeElement");

export default class RenderNode extends EventClass {

    /**
     * Creates the render node from the specified render node data
     * @param {RenderNode.renderNodeDataTypedef} renderNodeData - specifies the render node data
     */
    constructor(renderNodeData) {
        super();

        this[_renderer] = renderNodeData.renderer;
        this[_nodeId] = renderNodeData.nodeId;
        this[_nodeName] = null;
        this[_nodeSize] = [0, 0];
        this[_nodePosition] = [0, 0];
        this[_nodeElement] = renderNodeData.nodeElement;
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
     * Returns this render node id
     * @returns {string}
     */
    get nodeId() { return this[_nodeId]; }
    /**
     * Returns this render node name
     * @returns {string}
     */
    get nodeName() { return this[_nodeName]; }
    /**
     * Sets this block id
     * @param {string} nodeName - the node name to set
     */
    set nodeName(nodeName) { this[_nodeName] = nodeName; }
    /**
     * Returns this render node size
     * @returns {Array<number>}
     */
    get nodeSize() { return this[_nodeSize]; }
    /**
     * Returns this render node position
     * @returns {Array<number>}
     */
    get nodePosition() { return this[_nodePosition]; }
    /**
     * Sets this block id
     * @param {Array<number>} nodePosition - the node position to set
     */
    set nodePosition(nodePosition) { this[_nodePosition] = nodePosition; }
    /**
     * Returns this render node d3 element
     * @returns {string}
     */
    get nodeElement() { return this[_nodeElement]; }

    added() {}
    removed() {}

    move() {}
    update() {}

    selected() {}
    deselected() {}

    computeSize() {}
    computePosition() {}

}

/**
 * @typedef {Object} RenderNode.renderNodeDataTypedef
 * @property {Renderer} renderer
 * @property {string} nodeId
 * @property {d3.selection} nodeElement
 */
