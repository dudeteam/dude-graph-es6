const _renderer = Symbol("renderer");

export default class RenderNodeFinder {

    /**
     * Creates an optimized finder of nodes in the specified renderer
     * @param {Renderer} renderer - specifies the renderer
     */
    constructor(renderer) {
        this[_renderer] = renderer;
    }

    /**
     * Returns the best renderGroup capable of containing the specified renderBlock
     * @param {RenderBlock} renderBlock - specifies the render block
     * @returns {RenderGroup|null}
     */
    nearestRenderGroup(renderBlock) {
        return this && renderBlock ? null : null;
    }

}
