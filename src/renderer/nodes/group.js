import RenderNode from "./node";
import {renderNodesBoundingBox, textBoundingBox} from "../utils/measure";

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
        this.renderBlocks.push(renderBlock);
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
        if (renderBlock.parent !== this || !this.renderBlocks.includes(renderBlock)) {
            throw new Error(this.fancyName + " has no " + renderBlock.fancyName);
        }
        this.renderBlocks.splice(this.renderBlocks.indexOf(renderBlock), 1);
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
        this.size = this.preferredSize();

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
        this.position = this.preferredPosition();

        this.element.attr("transform", "translate(" + this.position + ")");
    }

    /**
     * Returns the preferred position of this render group
     * @returns {Array<number>}
     */
    preferredPosition() {
        const contentBoundingBox = renderNodesBoundingBox(this.renderBlocks);
        if (contentBoundingBox !== null) {
            return [
                contentBoundingBox[0][0] - this.renderer.config.group.padding,
                contentBoundingBox[0][1] - this.renderer.config.group.padding - this.renderer.config.group.header
            ];
        }
        return this.position;
    }

    /**
     * Returns the preferred size of this render group
     * @returns {Array<number>}
     */
    preferredSize() {
        const size = [0, 0];
        const contentBoundingBox = renderNodesBoundingBox(this.renderBlocks);
        if (contentBoundingBox !== null) {
            size[0] = contentBoundingBox[1][0] - contentBoundingBox[0][0] + this.renderer.config.group.padding * 2;
            size[1] = contentBoundingBox[1][1] - contentBoundingBox[0][1] + this.renderer.config.group.padding * 2 + this.renderer.config.group.header;
        } else {
            size[0] = this.renderer.config.group.minSize[0] + this.renderer.config.group.padding * 2;
            size[1] = this.renderer.config.group.minSize[1] + this.renderer.config.group.padding * 2 + this.renderer.config.group.header;
        }
        size[0] = Math.max(size[0], textBoundingBox(this.name || "")[0] + this.renderer.config.group.padding * 2);
        return size;
    }

}
