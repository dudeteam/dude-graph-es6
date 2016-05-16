import isString from 'lodash-es/isString';
import isNumber from 'lodash-es/isNumber';
import isBoolean from 'lodash-es/isBoolean';
import isObject from 'lodash-es/isObject';
import isArray from 'lodash-es/isArray';
import toString from 'lodash-es/toString';
import toNumber from 'lodash-es/toNumber';
import EventClass from 'event-class';

class Graph extends EventClass {

    constructor() {
        super();
        this._valueTypes = {
            "Stream": {
                "convert": () => undefined,
                "typeCompatibles": []
            },
            "String": {
                "typeConvert": (value) => {
                    if (isString(value)) {
                        return value;
                    }
                    if (isNumber(value) || isBoolean(value)) {
                        return toString(value);
                    }
                    return undefined;
                },
                "typeCompatibles": ["Text", "Number", "Boolean"]
            },
            "Text": {
                "typeConvert": (value) => {
                    if (isString(value)) {
                        return value;
                    }
                    if (isNumber(value) || isBoolean(value)) {
                        return toString(value);
                    }
                    return undefined;
                },
                "typeCompatibles": ["String", "Number", "Boolean"]
            },
            "Number": {
                "typeConvert": (value) => {
                    if (isNumber(value)) {
                        return value;
                    }
                    if (/^[-+]?[0-9]+(\.[0-9]+)?$/.test(value)) {
                        return toNumber(value);
                    }
                    if (value === "true" || value === true) {
                        return 1;
                    }
                    if (value === "false" || value === false) {
                        return 0;
                    }
                    return undefined;
                },
                "typeCompatibles": ["Boolean"]
            },
            "Boolean": {
                "typeConvert": (value) => {
                    if (isBoolean(value)) {
                        return value;
                    }
                    if (value === 1 || value === "true") {
                        return true;
                    }
                    if (value === 0 || value === "false") {
                        return false;
                    }
                    return undefined;
                },
                "typeCompatibles": ["Number"]
            },
            "Object": {
                "typeConvert": (value) => {
                    if (isObject(value)) {
                        return value;
                    }
                    return undefined;
                },
                "typeCompatibles": []
            },
            "Array": {
                "typeConvert": (value) => {
                    if (isArray(value)) {
                        return value;
                    }
                    return undefined;
                },
                "typeCompatibles": []
            },
            "Resource": {
                "typeConvert": (value) => {
                    if (isObject(value)) {
                        return value;
                    }
                    return undefined;
                },
                "typeCompatibles": []
            }
        };
    }

    get models() {}
    get blocks() {}
    get variables() {}
    get connections() {}

    query() {}

    addBlock() {}
    removeBlock() {}
    blockById() {}
    blocksByName() {}
    blocksByType() {}

    addVariable() {}
    removeVariable() {}
    variableById() {}
    variablesByType() {}

    connect() {}
    disconnect() {}

}

/**
 * @typedef {Object} Graph.templateTypedef
 * @property {String} valueType
 * @property {Array<String>} templates
 */

class Variable extends EventClass {

    added() {}
    removed() {}

    changeValue() {}

}

class Block extends EventClass {

    constructor() {
        super()
    }

    get id() {}
    get name() {}
    get inputs() {}
    get outputs() {}

    added() {}
    pointAdded() {}
    pointConnected() {}
    pointValueChanged() {}
    pointDisconnected() {}
    pointRemoved() {}
    removed() {}

    changeTemplate() {}
    templateById() {}

    addPoint() {}
    removePoint() {}
    removePoints() {}
    inputByName() {}
    outputByName() {}

    static create() {}

}

/**
 * @typedef {Object} dudeGraph.Block.blockDataTypedef
 * @property {String|null} [id=null]
 * @property {String} name
 * @property {Object<String, Graph.templateTypedef>} [blockTemplates={}]
 */

class Point extends EventClass {

    constructor() {
        super()
    }

    get name() {}
    get valueType() {}
    get value() {}

    added() {}
    accept() {}
    removed() {}

    changeValue() {}
    changeValueType() {}

    empty() {}
    emptyValue() {}
    emptyConnection() {}

    connect() {}
    disconnect() {}
    disconnectAll() {}

    connected() {}

    static create() {}

}

class Connection extends EventClass {

    other() {}
    remove() {}

}

export { Graph, Variable, Block, Point, Connection };
//# sourceMappingURL=dude-graph.js.map
