import {quadtree} from "d3";

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
        const tree = quadtree(this[_renderer].renderPoints, rp => rp.absolutePosition[0], rp => rp.absolutePosition[1]);
        const renderPoint = tree.find(position[0], position[1], this[_renderer].config.point.height);
        if (typeof renderPoint !== "undefined") {
            return renderPoint;
        }
        return null;
    }

}
