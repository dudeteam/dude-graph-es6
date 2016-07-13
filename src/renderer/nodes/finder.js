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
     * Returns the nearest render point of the specified position
     * @param {Array<number>} position - specifies the position
     * @returns {RenderPoint|null}
     */
    nearestRenderPoint(position) {
        const renderPoints = this[_renderer].renderPoints;
        for (const renderPoint of renderPoints)  {
            if (renderPoint.absolutePosition[0] > position[0] - this[_renderer].config.point.height &&
                renderPoint.absolutePosition[0] < position[0] + this[_renderer].config.point.height &&
                renderPoint.absolutePosition[1] > position[1] - this[_renderer].config.point.height &&
                renderPoint.absolutePosition[1] < position[1] + this[_renderer].config.point.height) {
                return renderPoint;
            }
        }
        return null;
    }

}
