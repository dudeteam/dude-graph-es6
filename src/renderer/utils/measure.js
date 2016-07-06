import maxBy from "lodash-es/maxBy";
import sumBy from "lodash-es/sumBy";
import isEqual from "lodash-es/isEqual";
import forEach from "lodash-es/forEach";
import {selection} from "d3";

/**
 * Returns the bounding box of the specified text
 * @param {string|selection} text - specifies the text
 * @returns {Array<number>}
 */
let sizeText = (text) => {
    if (text instanceof selection) {
        let boundingRect = text.node().getBoundingClientRect();
        let textSize = [(boundingRect.right - boundingRect.left), (boundingRect.bottom - boundingRect.top)];
        if (!isEqual(textSize, [0, 0])) {
            return textSize;
        }
        text = text.text();
    }
    return [text.length * 8, 17]; // Inconsolata font prediction
};

/**
 * Returns the rect (top left, bottom right) for the specified render nodes
 * @param {Array<RenderNode>} renderNodes - specifies the render nodes
 * @param {boolean} [nullable=false] - Whether to return null or [[0, 0], [0, 0]]
 * @returns {Array<Array<number>>}
 */
let sizeRenderNodes = (renderNodes, nullable) => {
    let topLeft = [Infinity, Infinity];
    let bottomRight = [-Infinity, -Infinity];
    forEach(renderNodes, (renderNode) => {
        topLeft[0] = Math.min(topLeft[0], renderNode.position[0]);
        topLeft[1] = Math.min(topLeft[1], renderNode.position[1]);
        bottomRight[0] = Math.max(bottomRight[0], renderNode.position[0] + renderNode.size[0]);
        bottomRight[1] = Math.max(bottomRight[1], renderNode.position[1] + renderNode.size[1]);
    });
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
let sizeRenderBlock = (renderBlock) => {
    let widerOutput = maxBy(renderBlock.renderOutputPoints, renderPoint => renderPoint.size[0]);
    let widerInput = maxBy(renderBlock.renderInputPoints, renderPoint => renderPoint.size[0]);
    let nameWidth = sizeText(renderBlock.name)[0];
    let outputWidth = typeof widerOutput === "undefined" ? 0 : widerOutput.size[0];
    let inputWidth = typeof widerInput === "undefined" ? 0 : widerInput.size[0];
    let maxPoints = renderBlock.renderOutputPoints.length > renderBlock.renderInputPoints ?
        renderBlock.renderOutputPoints : renderBlock.renderInputPoints;
    let pointsHeight = sumBy(maxPoints, renderPoint => renderPoint.size[1]);
    let maxWidth = Math.max(
        nameWidth + renderBlock.renderer.config.block.padding * 2,
        outputWidth + inputWidth + renderBlock.renderer.config.block.pointSpacing
    );
    return [maxWidth, pointsHeight + renderBlock.renderer.config.block.header];
};

/**
 * Returns the preferred size of the specified render group
 * @param {RenderGroup} renderGroup - specifies the render group
 * @returns {Array<number>}
 */
let sizeRenderGroup = (renderGroup) => {
    let size = [0, 0];
    let contentBoundingBox = sizeRenderNodes(renderGroup.renderBlocks, true);
    if (contentBoundingBox !== null) {
        size[0] = contentBoundingBox[1][0] - contentBoundingBox[0][0] + renderGroup.renderer.config.group.padding * 2;
        size[1] = contentBoundingBox[1][1] - contentBoundingBox[0][1] + renderGroup.renderer.config.group.padding * 2 + renderGroup.renderer.config.group.header;
    }
    size[0] = Math.max(size[0], renderGroup.renderer.config.group.minSize[0] + renderGroup.renderer.config.group.padding * 2);
    size[1] = Math.max(size[1], renderGroup.renderer.config.group.minSize[1] + renderGroup.renderer.config.group.padding * 2 + renderGroup.renderer.config.group.header);
    size[0] = Math.max(size[0], sizeText(renderGroup.name)[0] + renderGroup.renderer.config.group.padding * 2);
    return size;
};

/**
 * Returns the preferred size of the specified render point
 * @param {RenderPoint} renderPoint - specifies the render group
 * @returns {Array<number>}
 */
let sizeRenderPoint = (renderPoint) => {
    let textBoundingBox = sizeText(renderPoint.point.pointName);
    return [
        textBoundingBox[0] + renderPoint.renderBlock.renderer.config.point.padding * 2,
        renderPoint.renderBlock.renderer.config.point.height
    ];
};

/**
 * Returns the preferred position of the specified render group
 * @param {RenderGroup} renderGroup - specifies the render group
 * @returns {Array<number>}
 */
let positionRenderGroup = (renderGroup) => {
    let contentBoundingBox = sizeRenderNodes(renderGroup.renderBlocks, true);
    if (contentBoundingBox !== null) {
        return [
            contentBoundingBox[0][0] - renderGroup.renderer.config.group.padding,
            contentBoundingBox[0][1] - renderGroup.renderer.config.group.padding - renderGroup.renderer.config.group.header
        ];
    }
    return [0, 0];
};

/**
 * Returns the preferred size of the specified render point
 * @param {RenderPoint} renderPoint - specifies the render point
 * @returns {Array<number>}
 */
let positionRenderPoint = (renderPoint) => {
    if (renderPoint.point.pointOutput) {
        let index = renderPoint.renderBlock.renderOutputPoints.indexOf(renderPoint);
        return [
            renderPoint.renderBlock.size[0] - renderPoint.renderBlock.renderer.config.point.padding,
            renderPoint.renderBlock.renderer.config.block.header + renderPoint.renderBlock.renderer.config.point.height * index
        ];
    } else {
        let index = renderPoint.renderBlock.renderInputPoints.indexOf(renderPoint);
        return [
            renderPoint.renderBlock.renderer.config.point.padding,
            renderPoint.renderBlock.renderer.config.block.header + renderPoint.renderBlock.renderer.config.point.height * index
        ];
    }
};

export {sizeText, sizeRenderNodes};
export {sizeRenderBlock, sizeRenderGroup, sizeRenderPoint};
export {positionRenderGroup, positionRenderPoint};
