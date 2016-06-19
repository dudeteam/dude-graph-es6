import RenderNode from "./node";

let _renderBlocks = Symbol("renderBlocks");
let _svgRect = Symbol("svgRect");
let _svgName = Symbol("svgName");
let _svgPoints = Symbol("svgPoints");

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
     * Called when the render node is added
     * @override
     */
    added() {
        this[_svgRect] = this.element.append("svg:rect").classed("dude-graph-block-background", true);
        this[_svgName] = this.element.append("svg:text").classed("dude-graph-block-name", true);
        this[_svgPoints] = this.element.append("svg:g").classed("dude-graph-block-points", true);
    }

    /**
     * Called when the render group data changed and should update the element
     * @override
     */
    updateData() { this[_svgName].text(this.name); }
    /**
     * Called when the render group size changed and should update its element
     * @override
     */
    updateSize() {}
    /**
     * Called when the render group position changed and should update its element
     * @override
     */
    updatePosition() { this.element.attr("transform", "translate(" + this.position + ")"); }

}
