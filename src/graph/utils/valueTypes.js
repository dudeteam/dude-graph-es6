/**
 * Graph default value types
 * @type {object}
 */
export default {
    "Stream": {
        "convert": () => undefined,
        "typeCompatibles": []
    },
    "String": {
        "typeConvert": (value) => {
            if (typeof value === "string") {
                return value;
            }
            if (typeof value === "number" || typeof value === "boolean") {
                return "" + value;
            }
            return undefined;
        },
        "typeCompatibles": ["Text", "Number", "Boolean"]
    },
    "Text": {
        "typeConvert": (value) => {
            if (typeof value === "string") {
                return value;
            }
            if (typeof value === "number" || typeof value === "boolean") {
                return "" + value;
            }
            return undefined;
        },
        "typeCompatibles": ["String", "Number", "Boolean"]
    },
    "Number": {
        "typeConvert": (value) => {
            if (typeof value === "number") {
                return value;
            }
            if (/^[-+]?[0-9]+(\.[0-9]+)?$/.test(value)) {
                return parseFloat(value);
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
            if (typeof value === "boolean") {
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
            if (typeof value === "object") {
                return value;
            }
            return undefined;
        },
        "typeCompatibles": []
    },
    "Array": {
        "typeConvert": (value) => {
            if (Array.isArray(value)) {
                return value;
            }
            return undefined;
        },
        "typeCompatibles": []
    },
    "Resource": {
        "typeConvert": (value) => {
            if (typeof value === "object") {
                return value;
            }
            return undefined;
        },
        "typeCompatibles": []
    }
};
