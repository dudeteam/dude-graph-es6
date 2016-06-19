import {select} from "d3";
import pull from "lodash-es/pull";
import find from "lodash-es/find";
import filter from "lodash-es/filter";
import includes from "lodash-es/includes";

import config from "./defaults/config";
import uuid from "../graph/utils/uuid";

let _graph = Symbol("graph");
let _config = Symbol("config");
let _d3Svg = Symbol("d3svg");
let _d3Groups = Symbol("d3groups");
let _d3Connections = Symbol("d3connections");
let _d3Blocks = Symbol("d3blocks");
let _renderGroups = Symbol("renderGroups");
let _renderBlocks = Symbol("renderBlocks");
let _renderConnections = Symbol("renderConnections");
let _renderGroupIds = Symbol("renderGroupIds");
let _renderBlockIds = Symbol("renderBlockIds");

export default class Renderer {

    /**
     * Creates a renderer for the specified svg element and graph
     * @param {HTMLElement} svg - specifies the svg element
     * @param {Graph} graph - specifies the graph
     */
    constructor(svg, graph) {
        this[_graph] = graph;
        this[_config] = config;
        this[_d3Svg] = select(svg);
        this[_d3Groups] = this[_d3Svg].append("svg:g").classed("dude-graph-groups", true);
        this[_d3Connections] = this[_d3Svg].append("svg:g").classed("dude-graph-connections", true);
        this[_d3Blocks] = this[_d3Svg].append("svg:g").classed("dude-graph-blocks", true);
        this[_renderGroups] = [];
        this[_renderBlocks] = [];
        this[_renderConnections] = [];
        this[_renderGroupIds] = {};
        this[_renderBlockIds] = {};
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
        renderBlock.renderer = this;
        this[_renderBlocks].push(renderBlock);
        this[_renderBlockIds][renderBlock.id] = renderBlock;
        renderBlock.element = this[_d3Blocks].append("svg:g").datum(renderBlock);
        renderBlock.element.attr("id", "bid-" + renderBlock.id);
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
        renderGroup.element = this[_d3Groups].append("svg:g").datum(renderGroup);
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

    /*
    // adds the render point to the specified render block
    addRenderPoint(renderBlock, renderPoint) {}
    removeRenderPoint(renderPoint) {}
    renderPointByName(renderBlock, pointOutput, pointName) {}

    // adds the render connection and sets/create its svg:path element
    addRenderConnection(renderConnection) {}
    removeRenderConnection(renderConnection) {}
    renderConnectionByConnection(connection) {}
    */

}