/**
 * Returns the bounding box of the specified text
 * @param {string} text - specifies the text
 * @returns {Array<number>}
 */
export const textBoundingBox = (text) => {
    return [text.length * 8, 17]; // Inconsolata font prediction
};

/**
 * Returns the area covered by the specified render nodes
 * @param {Array<RenderNode>} renderNodes - specifies the render nodes
 * @param {boolean} [nullable=false] - specifies whether to return null or [[0, 0], [0, 0]]
 * @returns {Array<Array<number>>}
 */
export const renderNodesBoundingBox = (renderNodes, nullable) => {
    const topLeft = [Infinity, Infinity];
    const bottomRight = [-Infinity, -Infinity];
    for (const renderNode of renderNodes) {
        topLeft[0] = Math.min(topLeft[0], renderNode.position[0]);
        topLeft[1] = Math.min(topLeft[1], renderNode.position[1]);
        bottomRight[0] = Math.max(bottomRight[0], renderNode.position[0] + renderNode.size[0]);
        bottomRight[1] = Math.max(bottomRight[1], renderNode.position[1] + renderNode.size[1]);
    }
    if (topLeft[0] === Infinity || bottomRight[0] === -Infinity) {
        return nullable ? null : [[0, 0], [0, 0]];
    }
    return [topLeft, bottomRight];
};

/**
 * Returns the preferred size of the specified render block
 * @param {RenderBlock} renderBlock - specifies the render block
 * @returns {Array<number>}
 */
export const renderBlockPreferredSize = (renderBlock) => {
    let widerInput = null;
    let widerOutput = null;
    let pointsHeight = 0;
    for (const renderPoint of renderBlock.renderInputPoints) {
        if (widerInput === null) {
            widerInput = renderPoint;
        } else {
            if (renderPoint.size[0] >= widerInput.size[0]) {
                widerInput = renderPoint;
            }
        }
    }
    for (const renderPoint of renderBlock.renderOutputPoints) {
        if (widerOutput === null) {
            widerOutput = renderPoint;
        } else {
            if (renderPoint.size[0] >= widerOutput.size[0]) {
                widerOutput = renderPoint;
            }
        }
    }
    const nameWidth = textBoundingBox(renderBlock.name)[0];
    const inputWidth = widerInput === null ? 0 : widerInput.size[0];
    const outputWidth = widerOutput === null ? 0 : widerOutput.size[0];
    const tallerRenderPoints = renderBlock.renderInputPoints.length >= renderBlock.renderOutputPoints.length ? renderBlock.renderInputPoints : renderBlock.renderOutputPoints;
    for (const renderPoint of tallerRenderPoints) {
        pointsHeight += renderPoint.size[1];
    }
    const maxWidth = Math.max(
        nameWidth + renderBlock.renderer.config.block.padding * 2,
        inputWidth + outputWidth + renderBlock.renderer.config.block.pointSpacing
    );
    return [maxWidth, pointsHeight + renderBlock.renderer.config.block.header];
};

/**
 * Returns the preferred size of the specified render group
 * @param {RenderGroup} renderGroup - specifies the render group
 * @returns {Array<number>}
 */
export const renderGroupPreferredSize = (renderGroup) => {
    const size = [0, 0];
    const contentBoundingBox = renderNodesBoundingBox(renderGroup.renderBlocks, true);
    if (contentBoundingBox !== null) {
        size[0] = contentBoundingBox[1][0] - contentBoundingBox[0][0] + renderGroup.renderer.config.group.padding * 2;
        size[1] = contentBoundingBox[1][1] - contentBoundingBox[0][1] + renderGroup.renderer.config.group.padding * 2 + renderGroup.renderer.config.group.header;
    }
    size[0] = Math.max(size[0], renderGroup.renderer.config.group.minSize[0] + renderGroup.renderer.config.group.padding * 2);
    size[1] = Math.max(size[1], renderGroup.renderer.config.group.minSize[1] + renderGroup.renderer.config.group.padding * 2 + renderGroup.renderer.config.group.header);
    size[0] = Math.max(size[0], textBoundingBox(renderGroup.name)[0] + renderGroup.renderer.config.group.padding * 2);
    return size;
};

/**
 * Returns the preferred size of the specified render point
 * @param {RenderPoint} renderPoint - specifies the render group
 * @returns {Array<number>}
 */
export const renderPointPreferredSize = (renderPoint) => {
    const nameBoundingBox = textBoundingBox(renderPoint.point.name);
    return [
        nameBoundingBox[0] + renderPoint.renderBlock.renderer.config.point.padding * 2,
        renderPoint.renderBlock.renderer.config.point.height
    ];
};

/**
 * Returns the preferred position of the specified render group
 * @param {RenderGroup} renderGroup - specifies the render group
 * @returns {Array<number>}
 */
export const renderGroupPreferredPosition = (renderGroup) => {
    const contentBoundingBox = renderNodesBoundingBox(renderGroup.renderBlocks, true);
    if (contentBoundingBox !== null) {
        return [
            contentBoundingBox[0][0] - renderGroup.renderer.config.group.padding,
            contentBoundingBox[0][1] - renderGroup.renderer.config.group.padding - renderGroup.renderer.config.group.header
        ];
    }
    return renderGroup.position;
};

/**
 * Returns the preferred position of the specified render point
 * @param {RenderPoint} renderPoint - specifies the render point
 * @returns {Array<number>}
 */
export const renderPointPreferredPosition = (renderPoint) => {
    if (renderPoint.point.input) {
        const index = renderPoint.renderBlock.renderInputPoints.indexOf(renderPoint);
        return [
            renderPoint.renderBlock.renderer.config.point.padding,
            renderPoint.renderBlock.renderer.config.block.header + renderPoint.renderBlock.renderer.config.point.height * index
        ];
    } else {
        const index = renderPoint.renderBlock.renderOutputPoints.indexOf(renderPoint);
        return [
            renderPoint.renderBlock.size[0] - renderPoint.renderBlock.renderer.config.point.padding,
            renderPoint.renderBlock.renderer.config.block.header + renderPoint.renderBlock.renderer.config.point.height * index
        ];
    }
};

/**
 * Returns the preferred path between the specified from position and the specified to position
 * @param {Renderer} renderer - specifies the renderer
 * @param {Array<number>} from - specifies the from position
 * @param {Array<number>} to - specifies the to position
 * @returns {string}
 */
export const renderConnectionPreferredPath = (renderer, from, to) => {
    let step = renderer.config.connection.step;
    if (from[0] > to[0]) {
        step += Math.max(-renderer.config.connection.step, Math.min(from[0] - to[0], renderer.config.connection.step));
    }
    return `M${from[0]},${from[1]}C${from[0] + step},${from[1]} ${to[0] - step},${to[1]} ${to[0]},${to[1]}`;
};
