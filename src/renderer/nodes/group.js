import RenderNode from "./node";
import {sizeRenderGroup, positionRenderGroup} from "../utils/measure";

let _renderBlocks = Symbol("renderBlocks");
let _svgRect = Symbol("svgRect");
let _svgName = Symbol("svgName");

export default class RenderGroup extends RenderNode {

    constructor() {
        super();

        this[_renderBlocks] = [];
    }

    /**
     * Returns this group render blocks
     * @returns {Array<RenderBlock>}
     */
    get renderBlocks() {
        return this[_renderBlocks];
    }

    /**
     * Called when this render node is added
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
        this.size = sizeRenderGroup(this);

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
        this.position = positionRenderGroup(this);

        this.element.attr("transform", "translate(" + this.position + ")");
    }

}
