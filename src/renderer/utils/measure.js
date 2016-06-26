import maxBy from "lodash-es/maxBy";
import sumBy from "lodash-es/sumBy";
import forEach from "lodash-es/forEach";
import {selection} from "d3";

/**
 * Returns the rect (top left, bottom right) for the specified render nodes
 * @param {Array<RenderNode>} renderNodes - specifies the render nodes
 * @param {boolean} [nullable=false] - Whether to return null or [[0, 0], [0, 0]]
 * @returns {Array<Array<number>>}
 */
let renderNodesBoundingRect = (renderNodes, nullable) => {
    var topLeft = [Infinity, Infinity];
    var bottomRight = [-Infinity, -Infinity];
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
 * Returns the bounding box of the specified text
 * @param {string|selection} text - specifies the text
 * @returns {Array<number>}
 */
let sizeText = (text) => {
    if (text instanceof selection) {
        let boundingRect = text.node().getBoundingClientRect();
        let textSize = [(boundingRect.right - boundingRect.left), (boundingRect.bottom - boundingRect.top)];
        if (textSize[0] !== 0 && textSize[1] !== 0) {
            return textSize;
        }
        text = text.text();
    }
    return [text.length * 8, 17]; // Inconsolata font prediction
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
    let outputWidth = typeof widerOutput === "undefined" ? 0 : widerOutput;
    let inputWidth = typeof widerInput === "undefined" ? 0 : widerInput;
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
    let contentBoundingBox = renderNodesBoundingRect(renderGroup.renderBlocks, true);
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
 * Returns the preferred position of the specified render group
 * @param {RenderGroup} renderGroup - specifies the render group
 * @returns {Array<number>}
 */
let positionRenderGroup = (renderGroup) => {
    let contentBoundingBox = renderNodesBoundingRect(renderGroup.renderBlocks, true);
    if (contentBoundingBox !== null) {
        return [
            contentBoundingBox[0][0] - renderGroup.renderer.config.group.padding,
            contentBoundingBox[0][1] - renderGroup.renderer.config.group.padding - renderGroup.renderer.config.group.header
        ];
    }
    return [0, 0];
};

export {renderNodesBoundingRect};
export {sizeText, sizeRenderBlock, sizeRenderGroup};
export {positionRenderGroup};
