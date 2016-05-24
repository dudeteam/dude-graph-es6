import map from "lodash-es/map";
import pull from "lodash-es/pull";
import find from "lodash-es/find";
import forEach from "lodash-es/forEach";
import includes from "lodash-es/includes";
import isString from "lodash-es/isString";
import EventClass from "event-class-es6";
import forEachRight from "lodash-es/forEachRight";

import defaultValue from "./utils/default";

let _blockId = Symbol("blockId");
let _blockName = Symbol("blockName");
let _blockInputs = Symbol("blockInputs");
let _blockOutputs = Symbol("blockOutputs");
let _blockTemplates = Symbol("blockTemplate");
let _blockGraph = Symbol("blockGraph");

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
        if (this[_blockId] !== null && !isString(this[_blockId])) {
            throw new Error("`" + this.fancyName + "` must have a null or valid string `blockId`");
        }
        if (!isString(this[_blockName])) {
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
     * Sets this block id
     * @param {string|null} blockId - the block id to set
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
     * Sets this block graph to the specified block graph
     * @param {Graph|null} blockGraph - specifies the block graph
     */
    set blockGraph(blockGraph) { this[_blockGraph] = blockGraph; }

    added() {}
    pointAdded() {}
    pointConnected() {}
    pointValueChanged() {}
    pointDisconnected() {}
    pointRemoved() {}
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
        var template = this.templateByName(templateName);
        if (template === null) {
            throw new Error("`" + this.fancyName + "` has no template `" + templateName + "`");
        }
        if (!includes(template.templates, valueType)) {
            throw new Error("`" + this.fancyName + "` has no value type `" + valueType +
                "` is its templates: ` " + template.templates.join(", ") + "`");
        }
        if (template.valueType === valueType) {
            return; // Already the same type
        }
        var oldValueType = template.valueType;
        var outputValueSaves = map(this[_blockOutputs], (point) => {
            if (point.pointTemplate === templateName) {
                return point.pointValue;
            }
            return undefined;
        });
        var inputValueSaves = map(this[_blockInputs], (point) => {
            if (point.pointTemplate === templateName) {
                return point.pointValue;
            }
            return undefined;
        });
        try {
            forEach(this[_blockOutputs], (point) => {
                if (point.pointTemplate === templateName) {
                    point.changeValueType(valueType, ignoreEmit);
                }
            });
            forEach(this[_blockInputs], (point) => {
                if (point.pointTemplate === templateName) {
                    point.changeValueType(valueType, ignoreEmit);
                }
            });
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
                var template = this.templateByName(point.pointTemplate);
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
            pull(this[_blockOutputs], point);
        } else {
            pull(this[_blockInputs], point);
        }
        this.emit("point-remove", point);
        this[_blockGraph].emit("block-point-remove", this, point);
    }
    /**
     * Removes all block points
     */
    removePoints() {
        let block = this;
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
        return find(this[_blockOutputs], (point) => { return point.pointName === pointName; }) || null;
    }
    /**
     * Returns the corresponding input point for the specified point name
     * @param {string} pointName - specifies the point name
     * @returns {Point}
     */
    inputByName(pointName) {
        return find(this[_blockInputs], (point) => { return point.pointName === pointName; }) || null;
    }

    /**
     * Returns whether this block allows the connection between the specified block point and the other point
     * @param {Point} blockPoint - specifies this block point
     * @param {Point} otherPoint - specifies the other point
     * @returns {boolean}
     */
    acceptConnect(blockPoint, otherPoint) {
        if (blockPoint.pointBlock !== this) {
            throw new Error("`" + this.fancyName + "` has no `" + blockPoint.pointName + "`");
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
 * @property {string} blockName
 * @property {Object<string, Graph.templateTypedef>} [blockTemplates={}]
 */
