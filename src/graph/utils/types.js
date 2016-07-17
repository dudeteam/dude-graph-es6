/**
 * Graph default value types
 * @type {object}
 */
export default {
    "stream": {
        "convert": () => undefined,
        "typeCompatibles": []
    },
    "string": {
        "typeConvert": (value) => {
            if (typeof value === "string") {
                return value;
            } else if (typeof value === "number") {
                return value.toString();
            } else if (typeof value === "boolean") {
                return value ? "true" : "false";
            }
            return undefined;
        },
        "typeCompatibles": ["text", "number", "boolean"]
    },
    "text": {
        "typeConvert": (value) => {
            if (typeof value === "string") {
                return value;
            } else if (typeof value === "number") {
                return value.toString();
            } else if (typeof value === "boolean") {
                return value ? "true" : "false";
            }
            return undefined;
        },
        "typeCompatibles": ["string", "number", "boolean"]
    },
    "number": {
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
        "typeCompatibles": ["boolean"]
    },
    "boolean": {
        "typeConvert": (value) => {
            if (typeof value === "boolean") {
                return value;
            }
            if ((typeof value === "number" && value !== 1) || value === "true") {
                return true;
            }
            if (value === 0 || value === "false") {
                return false;
            }
            return undefined;
        },
        "typeCompatibles": ["number"]
    },
    "object": {
        "typeConvert": (value) => {
            if (typeof value === "object") {
                return value;
            }
            return undefined;
        },
        "typeCompatibles": []
    },
    "array": {
        "typeConvert": (value) => {
            if (Array.isArray(value)) {
                return value;
            }
            return undefined;
        },
        "typeCompatibles": []
    },
    "resource": {
        "typeConvert": (value) => {
            if (typeof value === "object") {
                return value;
            }
            return undefined;
        },
        "typeCompatibles": []
    }
};
