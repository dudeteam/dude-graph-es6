import {event, select, zoom} from "d3";
import pull from "lodash-es/pull";
import find from "lodash-es/find";
import clone from "lodash-es/clone";
import filter from "lodash-es/filter";
import includes from "lodash-es/includes";
import EventClass from "event-class-es6";

import uuid from "../graph/utils/uuid";
import config from "./defaults/config";
import RenderConnection from "./nodes/connection";

const _graph = Symbol("graph");
const _config = Symbol("config");
const _zoom = Symbol("zoomPan");
const _renderGroups = Symbol("renderGroups");
const _renderBlocks = Symbol("renderBlocks");
const _renderConnections = Symbol("renderConnections");
const _renderGroupIds = Symbol("renderGroupIds");
const _renderBlockIds = Symbol("renderBlockIds");
const _svg = Symbol("d3Svg");
const _svgRoot = Symbol("d3Root");
const _svgGroups = Symbol("d3Groups");
const _svgConnections = Symbol("d3Connections");
const _svgBlocks = Symbol("d3Blocks");
const _behaviorZoom = Symbol("zoomDrag");

export default class Renderer extends EventClass {

    /**
     * Creates a renderer for the specified graph and svg element
     * @param {Graph} graph - specifies the graph
     * @param {HTMLElement} svg - specifies the svg element
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
        this[_svg] = select(svg);
        this[_svgRoot] = this[_svg].append("svg:g");
        this[_svgGroups] = this[_svgRoot].append("svg:g").classed("dude-graph-groups", true);
        this[_svgConnections] = this[_svgRoot].append("svg:g").classed("dude-graph-connections", true);
        this[_svgBlocks] = this[_svgRoot].append("svg:g").classed("dude-graph-blocks", true);
        this[_behaviorZoom] = zoom();
        this._behaviorZoom();
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
     * Returns this renderer current zoom and pan
     * @returns {{zoom: number, pan: Array<number>}}
     */
    get zoomPan() { return this[_zoom]; }

    /**
     * Adds the specified render block to this renderer
     * @param {RenderBlock} renderBlock - specifies the render block
     */
    addRenderBlock(renderBlock) {
        if (renderBlock.block.blockGraph !== this[_graph]) {
            throw new Error("`" + this.fancyName + "` cannot add a renderBlock bound to another graph");
        }
        if (renderBlock.id !== null && typeof this[_renderBlockIds][renderBlock.id] !== "undefined") {
            throw new Error("`" + this.fancyName + "` cannot redefine id `" + renderBlock.id + "`");
        }
        if (renderBlock.id === null) {
            renderBlock.id = renderBlock.block.blockId + "#" + uuid();
        }
        this[_renderBlocks].push(renderBlock);
        this[_renderBlockIds][renderBlock.id] = renderBlock;
        renderBlock.renderer = this;
        renderBlock.element = this[_svgBlocks].append("svg:g").datum(renderBlock);
        renderBlock.element.attr("id", "bid-" + renderBlock.id);
        renderBlock.element.attr("class", "dude-graph-block");
        renderBlock.added();
    }
    /**
     * Removes the specified render block from this renderer
     * @param {RenderBlock} renderBlock - specifies the render block
     */
    removeRenderBlock(renderBlock) {
        if (renderBlock.renderer !== this || !includes(this[_renderBlocks], renderBlock)) {
            throw new Error("`" + this.fancyName + "` has no render block `" + renderBlock.fancyName + "`");
        }
        if (renderBlock.parent !== null) {
            throw new Error("`" + this.fancyName + "` cannot remove render block with a parent");
        }
        renderBlock.removed();
        renderBlock.element.remove();
        this[_renderBlockIds][renderBlock.id] = undefined;
        pull(this[_renderBlocks], renderBlock);
    }
    /**
     * Returns the corresponding render block for the specified render block id
     * @param {string} renderBlockId - specifies the render block id
     * @returns {RenderBlock|null}
     */
    renderBlockById(renderBlockId) {
        return find(this[_renderBlocks], renderBlock => renderBlock.id === renderBlockId) || null;
    }
    /**
     * Returns the corresponding render blocks for the specified block
     * @param {Block} block - specifies the block
     * @returns {Array<RenderBlock>}
     */
    renderBlocksByBlock(block) {
        return filter(this[_renderBlocks], renderBlock => renderBlock.block === block);
    }

    /**
     * Adds the specified render group to this renderer
     * @param {RenderGroup} renderGroup - specifies the render group
     */
    addRenderGroup(renderGroup) {
        if (renderGroup.id !== null && typeof this[_renderGroupIds][renderGroup.id] !== "undefined") {
            throw new Error("`" + this.fancyName + "` cannot redefine id `" + renderGroup.id + "`");
        }
        if (renderGroup.id === null) {
            renderGroup.id = uuid();
        }
        renderGroup.renderer = this;
        this[_renderGroups].push(renderGroup);
        this[_renderGroupIds][renderGroup.id] = renderGroup;
        renderGroup.element = this[_svgGroups].append("svg:g").datum(renderGroup);
        renderGroup.element.attr("id", "gid-" + renderGroup.id);
        renderGroup.element.attr("class", "dude-graph-group");
        renderGroup.added();
    }
    /**
     * Removes the specified render group from this renderer
     * @param {RenderGroup} renderGroup - specifies the render group
     */
    removeRenderGroup(renderGroup) {
        if (renderGroup.renderer !== this || !includes(this[_renderGroups], renderGroup)) {
            throw new Error("`" + this.fancyName + "` has no render block `" + renderGroup.fancyName + "`");
        }
        if (renderGroup.renderBlocks.length > 0) {
            throw new Error("`" + this.fancyName + "` cannot remove render group with render blocks");
        }
        renderGroup.removed();
        renderGroup.element.remove();
        this[_renderGroupIds][renderGroup.id] = undefined;
        pull(this[_renderGroups], renderGroup);
    }
    /**
     * Returns the corresponding render group for the specified render group id
     * @param {string} renderGroupId - specifies the render group id
     * @returns {RenderGroup|null}
     */
    renderGroupById(renderGroupId) {
        return find(this[_renderGroups], renderGroup => renderGroup.id === renderGroupId) || null;
    }

    /**
     * Connects the specified output render point to the specified input render point
     * @param {RenderPoint} outputRenderPoint - specifies the output render point
     * @param {RenderPoint} inputRenderPoint - specifies the input render point
     * @returns {RenderConnection}
     */
    connect(outputRenderPoint, inputRenderPoint) {
        if (outputRenderPoint.renderBlock === null) {
            throw new Error("`" + outputRenderPoint.fancyName +
                "` cannot connect to another render point when not bound to a render block");
        }
        if (inputRenderPoint.renderBlock === null) {
            throw new Error("`" + inputRenderPoint.fancyName +
                "` cannot connect to another render point when not bound to a render block");
        }
        if (outputRenderPoint.renderBlock.renderer !== this) {
            throw new Error("`" + outputRenderPoint.fancyName + "` is not in this renderer");
        }
        if (inputRenderPoint.renderBlock.renderer !== this) {
            throw new Error("`" + inputRenderPoint.fancyName + "` is not in this renderer");
        }
        if (!outputRenderPoint.point.pointOutput) {
            throw new Error("`" + outputRenderPoint.fancyName + "` is not an output");
        }
        if (inputRenderPoint.point.pointOutput) {
            throw new Error("`" + inputRenderPoint.fancyName + "` is not an input");
        }
        let connection = this[_graph].connectionForPoints(outputRenderPoint.point, inputRenderPoint.point);
        if (connection === null) {
            throw new Error("`" + outputRenderPoint.point.fancyName +
                "` is not connected to `" + inputRenderPoint.point.fancyName  + "`");
        }
        let renderConnectionFound = this.renderConnectionsForRenderPoints(outputRenderPoint, inputRenderPoint);
        if (renderConnectionFound !== null) {
            throw new Error("Cannot redefine `" + renderConnectionFound.fancyName + "`");
        }
        let renderConnection = new RenderConnection(connection, outputRenderPoint, inputRenderPoint);
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
     * @param {RenderPoint} outputRenderPoint - specifies the output render point
     * @param {RenderPoint} inputRenderPoint - specifies the input render point
     */
    disconnect(outputRenderPoint, inputRenderPoint) {
        if (outputRenderPoint.renderBlock === null) {
            throw new Error("`" + outputRenderPoint.fancyName +
                "` cannot connect to another render point when not bound to a render block");
        }
        if (inputRenderPoint.renderBlock === null) {
            throw new Error("`" + inputRenderPoint.fancyName +
                "` cannot connect to another render point when not bound to a render block");
        }
        if (outputRenderPoint.renderBlock.renderer !== this) {
            throw new Error("`" + outputRenderPoint.fancyName + "` is not in this renderer");
        }
        if (inputRenderPoint.renderBlock.renderer !== this) {
            throw new Error("`" + inputRenderPoint.fancyName + "` is not in this renderer");
        }
        if (!outputRenderPoint.point.pointOutput) {
            throw new Error("`" + outputRenderPoint.fancyName + "` is not an output");
        }
        if (inputRenderPoint.point.pointOutput) {
            throw new Error("`" + inputRenderPoint.fancyName + "` is not an input");
        }
        let renderConnection = this.renderConnectionsForRenderPoints(outputRenderPoint, inputRenderPoint);
        if (renderConnection === null) {
            throw new Error("`" + this.fancyName + "` cannot find a render connection between `" +
                outputRenderPoint.fancyName + "` and `" + inputRenderPoint.fancyName + "`");
        }
        outputRenderPoint.removeRenderConnection(renderConnection);
        inputRenderPoint.removeRenderConnection(renderConnection);
        pull(this[_renderConnections], renderConnection);
        renderConnection.removed();
        renderConnection.element.remove();
        renderConnection.renderer = null;
        this.emit("disconnect", renderConnection);
    }
    /**
     * Returns the render connection between the specified output render point from the specified input render point
     * @param {RenderPoint} outputRenderPoint - specifies the output render point
     * @param {RenderPoint} inputRenderPoint - specifies the input render point
     * @returns {RenderConnection|null}
     */
    renderConnectionsForRenderPoints(outputRenderPoint, inputRenderPoint) {
        return find(this[_renderConnections], (rc) => {
                return rc.outputRenderPoint === outputRenderPoint && rc.inputRenderPoint === inputRenderPoint;
            }) || null;
    }

    /**
     * Zooms and pans to the specified zoom and pan
     * @param {number} zoom - specifies the zoom
     * @param {Array<number>} pan - specifies the pan
     */
    zoom(zoom, pan) {
        this[_zoom].zoom = zoom;
        this[_zoom].pan = pan;
        this[_svgRoot].attr("transform", "translate(" + pan + ")scale(" + zoom + ")");
    }
    /**
     * Handles the renderer zoom
     * @private
     */
    _behaviorZoom() {
        let oldZoom = {"zoom": 1, "pan": [0, 0]};
        this[_svg].call(this[_behaviorZoom]);
        this[_behaviorZoom].scaleExtent(this[_config].zoom.scaleExtent);
        this[_behaviorZoom].on("start", () => {
            oldZoom = clone(this[_zoom]);
        });
        this[_behaviorZoom].on("zoom", () => {
            this.zoom(event.transform.k, [event.transform.x, event.transform.y]);
        });
        this[_behaviorZoom].on("end", () => {
            this.emit("renderer-zoom-pan", this[_zoom], oldZoom);
        });
    }

}
