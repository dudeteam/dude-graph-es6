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
     * Returns the nearest render nodes of the specified area
     * @param {Array<Array<number>>} area - specifies the area
     * @returns {Array<RenderNode>}
     */
    nearestRenderNodes(area) {
        return this[_renderer].renderNodes.filter(renderNode => {
            if (renderNode.position[0] + renderNode.size[0] < area[0][0]) { return false; }
            if (renderNode.position[0] > area[1][0]) { return false; }
            if (renderNode.position[1] + renderNode.size[1] < area[0][1]) { return false; }
            if (renderNode.position[1] > area[1][1]) { return false; }
            return true;
        });
    }

    /**
     * Returns the nearest render blocks of the specified area
     * @param {Array<Array<number>>} area - specifies the area
     * @returns {Array<RenderBlock>}
     */
    nearestRenderBlocks(area) {
        return this[_renderer].renderBlocks.filter(renderBlock => {
            if (renderBlock.position[0] + renderBlock.size[0] < area[0][0]) { return false; }
            if (renderBlock.position[0] > area[1][0]) { return false; }
            if (renderBlock.position[1] + renderBlock.size[1] < area[0][1]) { return false; }
            if (renderBlock.position[1] > area[1][1]) { return false; }
            return true;
        });
    }

    /**
     * Returns the nearest render groups of the specified area
     * @param {Array<Array<number>>} area - specifies the area
     * @returns {Array<RenderGroup>}
     */
    nearestRenderGroups(area) {
        return this[_renderer].renderGroups.filter(renderGroup => {
            if (renderGroup.position[0] + renderGroup.size[0] < area[0][0]) { return false; }
            if (renderGroup.position[0] > area[1][0]) { return false; }
            if (renderGroup.position[1] + renderGroup.size[1] < area[0][1]) { return false; }
            if (renderGroup.position[1] > area[1][1]) { return false; }
            return true;
        });
    }

    /**
     * Returns the nearest render groups of the specified area
     * @param {RenderBlock} renderBlock - the render group
     * @returns {RenderGroup|null}
     */
    nearestRenderGroup(renderBlock) {
        const groups = this[_renderer].renderGroups.filter(renderGroup => {
            if (renderGroup.position[0] > renderBlock.position[0]) { return false; }
            if (renderGroup.position[1] > renderBlock.position[1]) { return false; }
            if (renderGroup.position[0] + renderGroup.size[0] < renderBlock.position[0]) { return false; }
            if (renderGroup.position[1] + renderGroup.size[1] < renderBlock.position[1]) { return false; }
            return true;
        }).sort((rg1, rg2) => {
            if (renderBlock.parent === rg1) {
                return -1; // Always favorite the parent group
            } else if (renderBlock.parent === rg2) {
                return 1; // Always favorite the parent group
            }
            return rg1.element.index < rg2.element.index ? 1 : -1;
        });
        return groups.length > 0 ? groups[0] : null;
    }

    /**
     * Returns the nearest render point of the specified position and for the specified radius
     * @param {Array<number>} position - specifies the position
     * @param {number} radius - specifies the radius
     * @returns {RenderPoint|null}
     */
    nearestRenderPoint(position, radius = this[_renderer].config.point.radius) {
        return this[_renderer].renderPoints.find(renderPoint => {
            if (renderPoint.absolutePosition[0] + radius < position[0]) { return false; }
            if (renderPoint.absolutePosition[0] > position[0] + radius) { return false; }
            if (renderPoint.absolutePosition[1] + radius < position[1]) { return false; }
            if (renderPoint.absolutePosition[1] > position[1] + radius) { return false; }
            return true;
        }) || null;
    }

}
