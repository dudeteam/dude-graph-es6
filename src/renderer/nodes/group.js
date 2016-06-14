import RenderNode from "./node";

let _renderBlocks = Symbol("renderBlocks");

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
        this.element.append("svg:rect").classed("dude-graph-block-background", true);
        this.element.append("svg:text").classed("dude-graph-block-title", true);
        this.element.append("svg:g").classed("dude-graph-block-points", true);
    }

    /**
     * Called when the render node position changed and should move its element
     * @override
     */
    move() { this.element.attr("transform", "translate(" + this.position + ")"); }
    /**
     * Called when the render node changed and should update the element
     * @override
     */
    update() { this.move(); }

    /**
     * Called when the render node should compute its size
     * @override
     */
    computeSize() {}
    /**
     * Called when the render node should compute its position
     * @override
     */
    computePosition() {}

}
