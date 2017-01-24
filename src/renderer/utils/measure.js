/**
 * Returns the bounding box of the specified text
 * @param {string} text - specifies the text
 * @returns {Array<number>}
 */
export const textBoundingBox = (text) => {
    return [text.length * 9.6, 18]; // OxygenSans font prediction
};

/**
 * Returns the area covered by the specified render nodes
 * @param {Array<RenderNode>} renderNodes - specifies the render nodes
 * @returns {Array<Array<number>>|null}
 */
export const renderNodesBoundingBox = (renderNodes) => {
    if (renderNodes.length === 0) {
        return null;
    }
    return renderNodes.reduce((a, rn) => [
        [Math.min(a[0][0], rn.position[0]), Math.min(a[0][1], rn.position[1])],
        [Math.max(a[1][0], rn.position[0] + rn.size[0]), Math.max(a[1][1], rn.position[1] + rn.size[1])]
    ], [[Infinity, Infinity], [-Infinity, -Infinity]]);
};

/**
 * @param {Array<RenderPoint>} renderPoints - lol
 * @returns {Array<number>|null}
 */
export const renderPointsBoundingBox = (renderPoints) => {
    if (renderPoints.length === 0) {
        return null;
    }
    return renderPoints.reduce((a, rp) => [Math.max(a[0], rp.size[0]), Math.max(a[1], rp.size[1])], [0, 0]);
};
