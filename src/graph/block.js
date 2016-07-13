/*eslint no-unused-vars: "off"*/

import forEach from "lodash-es/forEach";
import EventClass from "event-class-es6";
import forEachRight from "lodash-es/forEachRight";

import defaultValue from "./utils/default";

const _blockId = Symbol("blockId");
const _blockName = Symbol("blockName");
const _blockInputs = Symbol("blockInputs");
const _blockOutputs = Symbol("blockOutputs");
const _blockTemplates = Symbol("blockTemplate");
const _blockGraph = Symbol("blockGraph");

export default class Block extends EventClass {

    /**
     * Creates a block from the specified block data
     * @param {Block.blockDataTypedef} [blockData={}] - specifies the block data
     */
    constructor(blockData) {
        super();

        if (typeof blockData === "undefined") {
            blockData = {};
        }
        this[_blockId] = defaultValue(blockData.blockId, null);
        this[_blockName] = defaultValue(blockData.blockName, this.blockType);
        this[_blockOutputs] = [];
        this[_blockInputs] = [];
        this[_blockTemplates] = defaultValue(blockData.blockTemplates, {});
        this[_blockGraph] = null;
        if (this[_blockId] !== null && typeof this[_blockId] !== "string") {
            throw new Error("`" + this.fancyName + "` must have a null or valid string `blockId`");
        }
        if (typeof this[_blockName] !== "string") {
            throw new Error("`" + this.fancyName + "` must have a non-null `blockName`");
        }
    }

    /**
     * Returns this block fancy name
     * @returns {string}
     */
    get fancyName() { return this[_blockName]; }
    /**
     * Returns this block type
     * @returns {string}
     */
    get blockType() { return this.constructor.name; }
    /**
     * Returns this block id
     * @returns {string|null}
     */
    get blockId() { return this[_blockId]; }
    /**
     * Sets this block id to the specified id
     * @param {string|null} blockId - specifies the id
     */
    set blockId(blockId) { this[_blockId] = blockId; }
    /**
     * Returns this block name
     * @returns {string}
     */
    get blockName() { return this[_blockName]; }
    /**
     * Returns this block output points
     * @returns {Array<Point>}
     */
    get blockOutputs() { return this[_blockOutputs]; }
    /**
     * Returns this block input points
     * @returns {Array<Point>}
     */
    get blockInputs() { return this[_blockInputs]; }
    /**
     * Returns this block templates
     * @returns {Object<string, Block.templateTypedef>}
     */
    get blockTemplates() { return this[_blockTemplates]; }
    /**
     * Returns this block graph
     * @returns {Graph|null}
     */
    get blockGraph() { return this[_blockGraph]; }
    /**
     * Sets this block graph to the specified graph
     * @param {Graph|null} blockGraph - specifies the graph
     */
    set blockGraph(blockGraph) { this[_blockGraph] = blockGraph; }

    /**
     * Called when this block is added to a graph
     */
    added() {}
    /**
     * Called when the specified point is added to this block
     * @param {Point} point - specifies the point
     */
    pointAdded(point) {}
    /**
     * Called when the specified point of this block connected to another point
     * @param {Point} blockPoint - specifies the point of this block
     * @param {Point} otherPoint - specifies the other point
     */
    pointConnected(blockPoint, otherPoint) {}
    /**
     * Called when the specified point of this block changed its value
     * @param {Point} point - specifies the point
     * @param {*} value - specifies the value
     * @param {*} oldValue - specifies the previous value
     */
    pointValueChanged(point, value, oldValue) {}
    /**
     * Called when the specified point of this block disconnected from another point
     * @param {Point} blockPoint - specifies the point of this block
     * @param {Point} otherPoint - specifies the other point
     */
    pointDisconnected(blockPoint, otherPoint) {}
    /**
     * Called when the specified point is removed from this block
     * @param {Point} point - specifies the point
     */
    pointRemoved(point) {}
    /**
     * Called when this block is removed from the graph
     */
    removed() {}

    /**
     * Called when the static points are created
     */
    validatePoints() {}

    /**
     * Changes this template value type corresponding to the specified template name to the specified value type
     * @param {string} templateName - specifies the template name
     * @param {string} valueType - specifies the value type
     * @param {boolean} [ignoreEmit=false] - whether to emit events
     */
    changeTemplate(templateName, valueType, ignoreEmit) {
        if (this[_blockGraph] === null) {
            throw new Error("`" + this.fancyName + "` cannot manipulate templates when not bound to a graph");
        }
        if (this[_blockGraph].valueTypeByName(valueType) === null) {
            throw new Error("`" + this.fancyName + "` has no value type `" + valueType + "`");
        }
        const template = this.templateByName(templateName);
        if (template === null) {
            throw new Error("`" + this.fancyName + "` has no template `" + templateName + "`");
        }
        if (!template.templates.includes(valueType)) {
            throw new Error("`" + this.fancyName + "` has no value type `" + valueType +
                "` is its templates: ` " + template.templates.join(", ") + "`");
        }
        if (template.valueType === valueType) {
            return; // Already the same type
        }
        const oldValueType = template.valueType;
        const outputValueSaves = this[_blockOutputs].map((point) => {
            if (point.pointTemplate === templateName) {
                return point.pointValue;
            }
            return undefined;
        });
        const inputValueSaves = this[_blockInputs].map((point) => {
            if (point.pointTemplate === templateName) {
                return point.pointValue;
            }
            return undefined;
        });
        try {
            for (const point of this[_blockOutputs]) {
                if (point.pointTemplate === templateName) {
                    point.changeValueType(valueType, ignoreEmit);
                }
            }
            for (const point of this[_blockInputs]) {
                if (point.pointTemplate === templateName) {
                    point.changeValueType(valueType, ignoreEmit);
                }
            }
        } catch (exception) {
            forEach(this[_blockOutputs], (point, i) => {
                if (point.pointTemplate === templateName) {
                    point.changeVariableValue(null);
                    point.changeValueType(oldValueType, true);
                    point.changeVariableValue(outputValueSaves[i]);
                }
            });
            forEach(this[_blockInputs], (point, i) => {
                if (point.pointTemplate === templateName) {
                    point.changeVariableValue(null);
                    point.changeValueType(oldValueType, true);
                    point.changeVariableValue(inputValueSaves[i]);
                }
            });
            throw exception;
        }
        template.valueType = valueType;
        if (!ignoreEmit) {
            this[_blockGraph].emit("block-template-update", this, templateName, template.valueType, oldValueType);
            this.emit("template-update", templateName, template.valueType, oldValueType);
        }
    }
    /**
     * Returns the template corresponding to the specified template name
     * @param {string} templateName - specifies the template name
     * @returns {Graph.templateTypedef|null}
     */
    templateByName(templateName) {
        if (this[_blockGraph] === null) {
            throw new Error("`" + this.fancyName + "` cannot manipulate templates when not bound to a graph");
        }
        return this[_blockTemplates][templateName] || null;
    }

    /**
     * Adds the specified point to this block
     * @param {Point} point - specifies the point
     * @param {number} [position] - the position of the point in the block
     */
    addPoint(point, position) {
        if (this[_blockGraph] === null) {
            throw new Error("`" + this.fancyName + "` cannot add point when not bound to a graph");
        }
        if (point.pointOutput && this.outputByName(point.pointName) !== null) {
            throw new Error("`" + this.fancyName + "` cannot redefine `" + point.pointName + "`");
        }
        if (!point.pointOutput && this.inputByName(point.pointName) !== null) {
            throw new Error("`" + this.fancyName + "` cannot redefine `" + point.pointName + "`");
        }
        point.pointBlock = this;
        try {
            if (point.pointTemplate === null) {
                point.changeValueType(point.pointValueType, true);
            } else {
                const template = this.templateByName(point.pointTemplate);
                if (template === null) {
                    //noinspection ExceptionCaughtLocallyJS
                    throw new Error("`" + this.fancyName + "` has no template `" + point.pointTemplate + "`");
                }
                point.changeValueType(template.valueType, true);
            }
            point.changeValue(point.pointValue, true);
        } catch (ex) {
            point.pointBlock = null;
            throw ex;
        }
        this.pointAdded(point);
        point.added();
        if (typeof position === "undefined") {
            position = point.pointOutput ? this[_blockOutputs].length : this[_blockInputs].length;
        }
        if (point.pointOutput) {
            this[_blockOutputs].splice(position, 0, point);
        } else {
            this[_blockInputs].splice(position, 0, point);
        }
        this.emit("point-add", point);
        this[_blockGraph].emit("block-point-add", this, point);
    }
    /**
     * Removes the specified point from this block
     * @param {Point} point - specifies the point
     */
    removePoint(point) {
        if (point.pointOutput && this.outputByName(point.pointName) === null) {
            throw new Error("`" + this.fancyName + "` has not output `" + point.pointName + "`");
        }
        if (!point.pointOutput && this.inputByName(point.pointName) === null) {
            throw new Error("`" + this.fancyName + "` has no input `" + point.pointName + "`");
        }
        point.disconnectAll();
        this.pointRemoved(point);
        point.removed();
        point.pointBlock = null;
        if (point.pointOutput) {
            this[_blockOutputs].splice(this[_blockOutputs].indexOf(point), 1);
        } else {
            this[_blockInputs].splice(this[_blockOutputs].indexOf(point), 1);
        }
        this.emit("point-remove", point);
        this[_blockGraph].emit("block-point-remove", this, point);
    }
    /**
     * Removes all block points
     */
    removePoints() {
        const block = this;
        forEachRight(this[_blockOutputs], (point) => {
            block.removePoint(point);
        });
        forEachRight(this[_blockInputs], (point) => {
            block.removePoint(point);
        });
    }
    /**
     * Returns the corresponding output point for the specified point name
     * @param {string} pointName - specifies the point name
     * @returns {Point}
     */
    outputByName(pointName) {
        return this[_blockOutputs].find(point => point.pointName === pointName) || null;
    }
    /**
     * Returns the corresponding input point for the specified point name
     * @param {string} pointName - specifies the point name
     * @returns {Point}
     */
    inputByName(pointName) {
        return this[_blockInputs].find(point => point.pointName === pointName) || null;
    }

    /**
     * Returns whether this block allows the connection between the specified block point and the other point
     * @param {Point} blockPoint - specifies this block point
     * @param {Point} otherPoint - specifies the other point
     * @returns {boolean}
     */
    acceptConnect(blockPoint, otherPoint) {
        if (blockPoint.pointBlock !== this) {
            throw new Error("`" + this.fancyName + "` has no point `" + blockPoint.pointName + "`");
        }
        return otherPoint === otherPoint;
    }

}

/**
 * @typedef {Object} Block.templateTypedef
 * @property {String} valueType
 * @property {Array<String>} templates
 */

/**
 * @typedef {Object} Block.blockDataTypedef
 * @property {string|null} [blockId=null]
 * @property {string} [blockName]
 * @property {Object<string, Graph.templateTypedef>} [blockTemplates={}]
 */
