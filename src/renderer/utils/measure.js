import maxBy from "lodash-es/maxBy";
import sumBy from "lodash-es/sumBy";
import {selection} from "d3";

/**
 * Returns the bounding box of the specified text
 * @param {string|selection} text - specifies the text
 * @returns {Array<number>}
 */
let measureText = (text) => {
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
let measureRenderBlock = (renderBlock) => {
    let widerOutput = maxBy(renderBlock.renderOutputPoints, renderPoint => renderPoint.size[0]);
    let widerInput = maxBy(renderBlock.renderInputPoints, renderPoint => renderPoint.size[0]);
    let nameWidth = measureText(renderBlock.name)[0];
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

export {measureText, measureRenderBlock};
