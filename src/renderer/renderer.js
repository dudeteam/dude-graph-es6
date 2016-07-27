import EventClass from "event-class-es6";

import uuid from "../graph/utils/uuid";
import htmlw from "./utils/htmlw";
import config from "./utils/config";
import RenderNodeFinder from "./utils/finder";
import RenderConnection from "./nodes/connection";

const _graph = Symbol("graph");
const _config = Symbol("config");
const _zoom = Symbol("zoomPan");
const _renderGroups = Symbol("renderGroups");
const _renderBlocks = Symbol("renderBlocks");
const _renderConnections = Symbol("renderConnections");
const _renderGroupIds = Symbol("renderGroupIds");
const _renderBlockIds = Symbol("renderBlockIds");
const _renderNodeFinder = Symbol("renderNodeFinder");
const _svg = Symbol("svg");
const _svgRoot = Symbol("svgRoot");
const _svgGroups = Symbol("svgGroups");
const _svgConnections = Symbol("svgConnections");
const _svgBlocks = Symbol("svgBlocks");

export default class Renderer extends EventClass {

    /**
     * Creates a renderer for the specified graph and svg element
     * @param {Graph} graph - specifies the graph
     * @param {Element} svg - specifies the svg element
     */
    constructor(graph, svg) {
        super();

        this[_graph] = graph;
        this[_config] = config;
        this[_zoom] = {"zoom": 1, "pan": [0, 0]};
        this[_renderGroups] = [];
        this[_renderBlocks] = [];
        this[_renderConnections] = [];
        this[_renderGroupIds] = {};
        this[_renderBlockIds] = {};
        this[_renderNodeFinder] = new RenderNodeFinder(this);
        this[_svg] = new htmlw(svg);
        this[_svgRoot] = this[_svg].append("svg:g");
        this[_svgGroups] = this[_svgRoot].append("svg:g").classed("dude-graph-groups");
        this[_svgConnections] = this[_svgRoot].append("svg:g").classed("dude-graph-connections");
        this[_svgBlocks] = this[_svgRoot].append("svg:g").classed("dude-graph-blocks");
    }

    /**
     * Returns this renderer fancy name
     * @returns {string}
     */
    get fancyName() { return "renderer (" + this[_renderBlocks].length + " render blocks)"; }

    /**
     * Returns this renderer config
     * @returns {Object}
     */
    get config() { return this[_config]; }
    /**
     * Sets this renderer config to the specified config
     * @param {Object} config - specifies the config
     */
    set config(config) { this[_config] = config; }
    /**
     * Returns this renderer render groups
     * @returns {Array<RenderGroup>}
     */
    get renderGroups() { return this[_renderGroups]; }
    /**
     * Returns this renderer render points
     * @returns {Array<RenderPoint>}
     */
    get renderPoints() {
        const renderPoints = [];
        this[_renderBlocks].forEach(rb => rb.renderPoints.forEach(rp => renderPoints.push(rp)));
        return renderPoints;
    }
    /**
     * Returns this renderer render blocks
     * @returns {Array<RenderBlock>}
     */
    get renderBlocks() { return this[_renderBlocks]; }
    /**
     * Returns this renderer render groups
     * @returns {Array<RenderConnection>}
     */
    get renderConnections() { return this[_renderConnections]; }
    /**
     * Returns this renderer render node finder
     * @returns {RenderNodeFinder}
     */
    get renderNodeFinder() { return this[_renderNodeFinder]; }
    /**
     * Returns this renderer svg element
     * @returns {HTMLWrapper}
     */
    get svg() { return this[_svg]; }
    /**
     * Returns this renderer svg root element
     * @returns {HTMLWrapper}
     */
    get svgRoot() {return this[_svgRoot]; }
    /**
     * Returns this renderer svg groups element
     * @returns {HTMLWrapper}
     */
    get svgGroups() {return this[_svgGroups]; }
    /**
     * Returns this renderer svg blocks element
     * @returns {HTMLWrapper}
     */
    get svgBlocks() {return this[_svgBlocks]; }
    /**
     * Returns this renderer svg connections element
     * @returns {HTMLWrapper}
     */
    get svgConnections() {return this[_svgConnections]; }

    /**
     * Adds the specified render block to this renderer
     * @param {RenderBlock} renderBlock - specifies the render block
     */
    addRenderBlock(renderBlock) {
        if (renderBlock.block.graph !== this[_graph]) {
            throw new Error(this.fancyName + " cannot add a renderBlock bound to another graph");
        }
        if (renderBlock.id !== null && typeof this[_renderBlockIds][renderBlock.id] !== "undefined") {
            throw new Error(this.fancyName + " cannot redefine id " + renderBlock.id);
        }
        if (renderBlock.id === null) {
            renderBlock.id = renderBlock.block.id + "#" + uuid();
        }
        this[_renderBlocks].push(renderBlock);
        this[_renderBlockIds][renderBlock.id] = renderBlock;
        renderBlock.renderer = this;
        renderBlock.element = this[_svgBlocks].append("svg:g");
        renderBlock.element.attr("id", "bid-" + renderBlock.id);
        renderBlock.element.attr("class", "dude-graph-block");
        renderBlock.added();
        this.emit("render-block-add", renderBlock);
    }
    /**
     * Removes the specified render block from this renderer
     * @param {RenderBlock} renderBlock - specifies the render block
     */
    removeRenderBlock(renderBlock) {
        if (renderBlock.renderer !== this || !this[_renderBlocks].includes(renderBlock)) {
            throw new Error(this.fancyName + " has no render block " + renderBlock.fancyName);
        }
        if (renderBlock.parent !== null) {
            throw new Error(this.fancyName + " cannot remove render block with a parent");
        }
        renderBlock.removed();
        renderBlock.element.remove();
        this[_renderBlockIds][renderBlock.id] = undefined;
        this[_renderBlocks].splice(this[_renderBlocks].indexOf(renderBlock), 1);
        this.emit("render-block-remove", renderBlock);
    }
    /**
     * Returns the corresponding render block for the specified render block id
     * @param {string} renderBlockId - specifies the render block id
     * @returns {RenderBlock|null}
     */
    renderBlockById(renderBlockId) {
        return this[_renderBlocks].find(renderBlock => renderBlock.id === renderBlockId) || null;
    }
    /**
     * Returns the corresponding render blocks for the specified block
     * @param {Block} block - specifies the block
     * @returns {Array<RenderBlock>}
     */
    renderBlocksByBlock(block) {
        return this[_renderBlocks].filter(renderBlock => renderBlock.block === block);
    }

    /**
     * Adds the specified render group to this renderer
     * @param {RenderGroup} renderGroup - specifies the render group
     */
    addRenderGroup(renderGroup) {
        if (renderGroup.id !== null && typeof this[_renderGroupIds][renderGroup.id] !== "undefined") {
            throw new Error(this.fancyName + " cannot redefine id " + renderGroup.id);
        }
        if (renderGroup.id === null) {
            renderGroup.id = uuid();
        }
        renderGroup.renderer = this;
        this[_renderGroups].push(renderGroup);
        this[_renderGroupIds][renderGroup.id] = renderGroup;
        renderGroup.element = this[_svgGroups].append("svg:g");
        renderGroup.element.attr("id", "gid-" + renderGroup.id);
        renderGroup.element.attr("class", "dude-graph-group");
        renderGroup.added();
        this.emit("render-group-add", renderGroup);
    }
    /**
     * Removes the specified render group from this renderer
     * @param {RenderGroup} renderGroup - specifies the render group
     */
    removeRenderGroup(renderGroup) {
        if (renderGroup.renderer !== this || !this[_renderGroups].includes(renderGroup)) {
            throw new Error(this.fancyName + " has no render block " + renderGroup.fancyName);
        }
        if (renderGroup.renderBlocks.length > 0) {
            throw new Error(this.fancyName + " cannot remove render group with render blocks");
        }
        renderGroup.removed();
        renderGroup.element.remove();
        this[_renderGroupIds][renderGroup.id] = undefined;
        this[_renderGroups].splice(this[_renderGroups].indexOf(renderGroup), 1);
        this.emit("render-group-remove", renderGroup);
    }
    /**
     * Returns the corresponding render group for the specified render group id
     * @param {string} renderGroupId - specifies the render group id
     * @returns {RenderGroup|null}
     */
    renderGroupById(renderGroupId) {
        return this[_renderGroups].find(renderGroup => renderGroup.id === renderGroupId) || null;
    }

    /**
     * Connects the specified output render point to the specified input render point
     * @param {RenderPoint} inputRenderPoint - specifies the input render point
     * @param {RenderPoint} outputRenderPoint - specifies the output render point
     * @returns {RenderConnection}
     */
    connect(inputRenderPoint, outputRenderPoint) {
        if (outputRenderPoint.renderBlock === null) {
            throw new Error(outputRenderPoint.fancyName +
                " cannot connect to another render point when not bound to a render block");
        }
        if (inputRenderPoint.renderBlock === null) {
            throw new Error(inputRenderPoint.fancyName +
                " cannot connect to another render point when not bound to a render block");
        }
        if (outputRenderPoint.renderBlock.renderer !== this) {
            throw new Error(outputRenderPoint.fancyName + " is not in this renderer");
        }
        if (inputRenderPoint.renderBlock.renderer !== this) {
            throw new Error(inputRenderPoint.fancyName + " is not in this renderer");
        }
        if (!outputRenderPoint.point.output) {
            throw new Error(outputRenderPoint.fancyName + " is not an output");
        }
        if (inputRenderPoint.point.output) {
            throw new Error(inputRenderPoint.fancyName + " is not an input");
        }
        const connection = this[_graph].connectionForPoints(inputRenderPoint.point, outputRenderPoint.point);
        if (connection === null) {
            throw new Error(outputRenderPoint.point.fancyName +
                " is not connected to " + inputRenderPoint.point.fancyName);
        }
        const renderConnectionFound = this.renderConnectionsForRenderPoints(inputRenderPoint, outputRenderPoint);
        if (renderConnectionFound !== null) {
            throw new Error(this.fancyName + " cannot redefine " + renderConnectionFound.fancyName);
        }
        const renderConnection = new RenderConnection(connection, inputRenderPoint, outputRenderPoint);
        this[_renderConnections].push(renderConnection);
        outputRenderPoint.addRenderConnection(renderConnection);
        inputRenderPoint.addRenderConnection(renderConnection);
        renderConnection.renderer = this;
        renderConnection.element = this[_svgConnections].append("svg:path").attr("class", "dude-graph-connection");
        renderConnection.added();
        this.emit("connect", renderConnection);
        return renderConnection;
    }
    /**
     * Disconnects the specified output render point from the specified input render point
     * @param {RenderPoint} inputRenderPoint - specifies the input render point
     * @param {RenderPoint} outputRenderPoint - specifies the output render point
     */
    disconnect(inputRenderPoint, outputRenderPoint) {
        if (inputRenderPoint.renderBlock === null) {
            throw new Error(inputRenderPoint.fancyName +
                " cannot connect to another render point when not bound to a render block");
        }
        if (outputRenderPoint.renderBlock === null) {
            throw new Error(outputRenderPoint.fancyName +
                " cannot connect to another render point when not bound to a render block");
        }
        if (inputRenderPoint.renderBlock.renderer !== this) {
            throw new Error(inputRenderPoint.fancyName + " is not in this renderer");
        }
        if (outputRenderPoint.renderBlock.renderer !== this) {
            throw new Error(outputRenderPoint.fancyName + " is not in this renderer");
        }
        if (!inputRenderPoint.point.input) {
            throw new Error(inputRenderPoint.fancyName + " is not an input");
        }
        if (!outputRenderPoint.point.output) {
            throw new Error(outputRenderPoint.fancyName + " is not an output");
        }
        const renderConnection = this.renderConnectionsForRenderPoints(inputRenderPoint, outputRenderPoint);
        if (renderConnection === null) {
            throw new Error(this.fancyName + " cannot find a render connection between " +
                outputRenderPoint.fancyName + " and " + inputRenderPoint.fancyName);
        }
        inputRenderPoint.removeRenderConnection(renderConnection);
        outputRenderPoint.removeRenderConnection(renderConnection);
        this[_renderConnections].splice(this[_renderConnections].indexOf(renderConnection), 1);
        renderConnection.removed();
        renderConnection.element.remove();
        renderConnection.renderer = null;
        this.emit("disconnect", renderConnection);
    }
    /**
     * Returns the render connection between the specified output render point from the specified input render point
     * @param {RenderPoint} inputRenderPoint - specifies the input render point
     * @param {RenderPoint} outputRenderPoint - specifies the output render point
     * @returns {RenderConnection|null}
     */
    renderConnectionsForRenderPoints(inputRenderPoint, outputRenderPoint) {
        return this[_renderConnections].find((rc) => {
                return rc.inputRenderPoint === inputRenderPoint && rc.outputRenderPoint === outputRenderPoint;
            }) || null;
    }

}
