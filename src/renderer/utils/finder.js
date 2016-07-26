const _renderer = Symbol("renderer");

export default class RenderNodeFinder {

    /**
     * Creates an optimized finder of nodes for the specified renderer
     * @param {Renderer} renderer - specifies the renderer
     */
    constructor(renderer) {
        this[_renderer] = renderer;
    }

    /**
     * Returns the nearest render blocks of the specified area
     * @param {Array<Array<number>>} area - specifies the area
     * @returns {Array<RenderBlock>}
     */
    nearestRenderBlocks(area) {
        return this[_renderer].renderBlocks.filter((renderBlock) => {
            if (renderBlock.position[0] + renderBlock.size[0] < area[0][0]) { return false; }
            if (renderBlock.position[0] > area[1][0]) { return false; }
            if (renderBlock.position[1] + renderBlock.size[1] < area[0][1]) { return false; }
            if (renderBlock.position[1] > area[1][1]) { return false; }
            return true;
        });
    }

    /**
     * Returns the nearest render point of the specified position
     * @param {Array<number>} position - specifies the position
     * @returns {RenderPoint|null}
     */
    nearestRenderPoint(position) {
        return this[_renderer].renderPoints.find((renderPoint) => {
            if (renderPoint.absolutePosition[0] + this[_renderer].config.point.radius < position[0]) { return false; }
            if (renderPoint.absolutePosition[0] > position[0] + this[_renderer].config.point.radius) { return false; }
            if (renderPoint.absolutePosition[1] + this[_renderer].config.point.radius < position[1]) { return false; }
            if (renderPoint.absolutePosition[1] > position[1] + this[_renderer].config.point.radius) { return false; }
            return true;
        }) || null;
    }

}
