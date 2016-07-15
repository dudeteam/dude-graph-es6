import RenderNode from "./node";
import {renderGroupPreferredSize, renderGroupPreferredPosition} from "../utils/measure";

const _renderBlocks = Symbol("renderBlocks");
const _svgRect = Symbol("svgRect");
const _svgName = Symbol("svgName");

export default class RenderGroup extends RenderNode {

    constructor() {
        super();

        this[_renderBlocks] = [];
        this.name = "";
    }

    /**
     * Returns this group render blocks
     * @returns {Array<RenderBlock>}
     */
    get renderBlocks() { return this[_renderBlocks]; }

    /**
     * Adds the specified render block to this render group
     * @param {RenderBlock} renderBlock - specifies the render block
     */
    addRenderBlock(renderBlock) {
        if (this.renderer === null) {
            throw new Error(this.fancyName + " cannot add renderBlock when not bound to a renderer");
        }
        if (this.renderer !== renderBlock.renderer) {
            throw new Error(this.fancyName + " is not in the same renderer as " + renderBlock.fancyName);
        }
        if (renderBlock.parent !== null) {
            throw new Error(renderBlock.fancyName + " cannot redefine parent");
        }
        this[_renderBlocks].push(renderBlock);
        renderBlock.parent = this;
    }
    /**
     * Removes the specified render block from this render group
     * @param {RenderBlock} renderBlock - specifies the render block
     */
    removeRenderBlock(renderBlock) {
        if (this.renderer === null) {
            throw new Error(this.fancyName + " cannot remove renderBlock when not bound to a renderer");
        }
        if (renderBlock.parent !== this || !this[_renderBlocks].includes(renderBlock)) {
            throw new Error(this.fancyName + " has no " + renderBlock.fancyName);
        }
        this[_renderBlocks].splice(this[_renderBlocks].indexOf(renderBlock), 1);
        renderBlock.parent = null;
    }

    /**
     * Called when this render group is added
     * @override
     */
    added() {
        this[_svgRect] = this.element.append("svg:rect").classed("dude-graph-group-background", true);
        this[_svgName] = this.element.append("svg:text").classed("dude-graph-group-name", true);

        this[_svgRect].attr("rx", this.renderer.config.block.borderRadius);
        this[_svgRect].attr("ry", this.renderer.config.block.borderRadius);

        this[_svgName].attr("text-anchor", "middle");
        this[_svgName].attr("dominant-baseline", "text-before-edge");
    }

    /**
     * Called when this render group data changed and should update the element
     * @override
     */
    updateData() { this[_svgName].text(this.name); }
    /**
     * Called when this render group size changed and should update its element
     * @override
     */
    updateSize() {
        this.size = renderGroupPreferredSize(this);

        this[_svgRect].attr("width", this.size[0]);
        this[_svgRect].attr("height", this.size[1]);

        this[_svgName].attr("x", this.size[0] / 2);
        this[_svgName].attr("y", this.renderer.config.group.padding);
    }
    /**
     * Called when this render group position changed and should update its element
     * @override
     */
    updatePosition() {
        this.position = renderGroupPreferredPosition(this);

        this.element.attr("transform", "translate(" + this.position + ")");
    }

}
