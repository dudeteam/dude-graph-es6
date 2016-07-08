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
const textBoundingBox = (text) => {
    if (text instanceof selection) {
        const boundingRect = text.node().getBoundingClientRect();
        const textSize = [(boundingRect.right - boundingRect.left), (boundingRect.bottom - boundingRect.top)];
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
const renderNodesBoundingBox = (renderNodes, nullable) => {
    const topLeft = [Infinity, Infinity];
    const bottomRight = [-Infinity, -Infinity];
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
const renderBlockPreferredSize = (renderBlock) => {
    const widerOutput = maxBy(renderBlock.renderOutputPoints, renderPoint => renderPoint.size[0]);
    const widerInput = maxBy(renderBlock.renderInputPoints, renderPoint => renderPoint.size[0]);
    const nameWidth = textBoundingBox(renderBlock.name)[0];
    const outputWidth = typeof widerOutput === "undefined" ? 0 : widerOutput.size[0];
    const inputWidth = typeof widerInput === "undefined" ? 0 : widerInput.size[0];
    const maxPoints = renderBlock.renderOutputPoints.length > renderBlock.renderInputPoints ?
        renderBlock.renderOutputPoints : renderBlock.renderInputPoints;
    const pointsHeight = sumBy(maxPoints, renderPoint => renderPoint.size[1]);
    const maxWidth = Math.max(
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
const renderGroupPreferredSize = (renderGroup) => {
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
const renderPointPreferredSize = (renderPoint) => {
    const pointNameBoundingBox = textBoundingBox(renderPoint.point.pointName);
    return [
        pointNameBoundingBox[0] + renderPoint.renderBlock.renderer.config.point.padding * 2,
        renderPoint.renderBlock.renderer.config.point.height
    ];
};

/**
 * Returns the preferred position of the specified render group
 * @param {RenderGroup} renderGroup - specifies the render group
 * @returns {Array<number>}
 */
const renderGroupPreferredPosition = (renderGroup) => {
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
const renderPointPreferredPosition = (renderPoint) => {
    if (renderPoint.point.pointOutput) {
        const index = renderPoint.renderBlock.renderOutputPoints.indexOf(renderPoint);
        return [
            renderPoint.renderBlock.size[0] - renderPoint.renderBlock.renderer.config.point.padding,
            renderPoint.renderBlock.renderer.config.block.header + renderPoint.renderBlock.renderer.config.point.height * index
        ];
    } else {
        const index = renderPoint.renderBlock.renderInputPoints.indexOf(renderPoint);
        return [
            renderPoint.renderBlock.renderer.config.point.padding,
            renderPoint.renderBlock.renderer.config.block.header + renderPoint.renderBlock.renderer.config.point.height * index
        ];
    }
};

/**
 * Returns the preferred path of the specified render connection for the specified d3 line
 * @param {RenderConnection} renderConnection - specifies the render connection
 * @param {function} line - specifies the d3 line
 * @returns {string}
 */
const renderConnectionPreferredPath = (renderConnection, line) => {
    const outputRenderPoint = renderConnection.outputRenderPoint;
    const inputRenderPoint = renderConnection.inputRenderPoint;
    let step = renderConnection.renderer.config.connection.step;
    if (outputRenderPoint.absolutePosition[0] > inputRenderPoint.absolutePosition[0]) {
        step += Math.max(
            -renderConnection.renderer.config.connection.step,
            Math.min(
                outputRenderPoint.absolutePosition[0] - inputRenderPoint.absolutePosition[0],
                renderConnection.renderer.config.connection.step
            )
        );
    }
    const outputRenderPointPosition = outputRenderPoint.absolutePosition;
    const inputRenderPointPosition = inputRenderPoint.absolutePosition;
    const connectionPoints = [
        [outputRenderPointPosition[0], outputRenderPointPosition[1]],
        [outputRenderPointPosition[0] + step, outputRenderPointPosition[1]],
        [inputRenderPointPosition[0] - step, inputRenderPointPosition[1]],
        [inputRenderPointPosition[0], inputRenderPointPosition[1]]
    ];
    return line(connectionPoints);
};

export {textBoundingBox, renderNodesBoundingBox};
export {renderBlockPreferredSize, renderGroupPreferredSize, renderPointPreferredSize};
export {renderGroupPreferredPosition, renderPointPreferredPosition};
export {renderConnectionPreferredPath};
