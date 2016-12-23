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
 * @param {boolean} nullable - specifies whether to return null or [[0, 0], [0, 0]]
 * @returns {Array<Array<number>>}
 */
export const renderNodesBoundingBox = (renderNodes, nullable = false) => {
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
