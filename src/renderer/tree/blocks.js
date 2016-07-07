import {quadtree} from "d3";
import forEach from "lodash-es/forEach";

const _renderer = Symbol("renderer");

export default class RenderNodeFinder {

    constructor(renderer) {
        this[_renderer] = renderer;
    }

    /**
     * Returns all RenderBlocks overlapping the specified area
     * @param {Array<Array<number>>} area - specifies the area
     * @returns {Array<RenderBlock>}
     */
    nearestRenderBlocks(area) {
        const renderBlockTree = quadtree().x(rb => rb.position[0]).y(rb => rb.position[1])(this[_renderer].renderBlocks);
        const renderBlocks = [];
        renderBlockTree.visit((d3QuadtreeNode, x1, y1, x2, y2) => {
            const renderBlock = d3QuadtreeNode.point;
            if (renderBlock) {
                const bounds = [
                    renderBlock.position[0],
                    renderBlock.position[1],
                    renderBlock.position[0] + renderBlock.size[0],
                    renderBlock.position[1] + renderBlock.size[1]
                ];
                if (!(area[0][0] > bounds[2] || area[0][1] > bounds[3] || area[1][0] < bounds[0] || area[1][1] < bounds[1])) {
                    renderBlocks.push(renderBlock);
                }
            }
            return x1 - 50 >= area[1][0] || y1 - 35 >= area[1][1] || x2 + 50 < area[0][0] || y2 + 35 < area[0][1];
        });
        return renderBlocks;
    }

    /**
     * Returns the best renderGroup capable of containing the specified renderBlock
     * @param {RenderBlock} renderBlock - specifies the render block
     * @returns {RenderGroup|null}
     */
    nearestRenderGroup(renderBlock) {
        const renderGroupTree = quadtree().x(rb => rb.position[0]).y(rb => rb.position[1])(this[_renderer].renderBlocks);
        const renderGroups = [];
        const x0 = renderBlock.position[0];
        const y0 = renderBlock.position[1];
        const x3 = renderBlock.position[0] + renderBlock.size[0];
        const y3 = renderBlock.position[1] + renderBlock.size[1];
        let renderGroup = null;
        renderGroupTree.visit((d3QuadtreeNode) => {
            const rg = d3QuadtreeNode.point;
            if (rg && rg !== renderBlock) {
                const bounds = [rg.position[0], rg.position[1], rg.position[0] + rg.size[0], rg.position[1] + rg.size[1]];
                if (x0 > bounds[0] && y0 > bounds[1] && x3 < bounds[2] && y3 < bounds[3]) {
                    renderGroups.push(rg);
                }
            }
            return false;
        });
        forEach(renderGroups, (rg) => {
            if (renderBlock.parent && rg === renderBlock.parent) {
                renderGroup = rg;
                return false;
            }
            if (renderGroup === null) {
                renderGroup = rg;
            } else if (rg.size[0] < renderGroup.size[0] && rg.size[1] < renderGroup.size[1]) {
                renderGroup = rg;
            }
            return true;
        });
        return renderGroup;
    }

}
