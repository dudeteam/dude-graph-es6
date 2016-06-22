/**
 * Renderer default configuration
 * @type {object}
 */
let rendererConfig = {
    "zoom": {
        "margin": [10, 10],
        "scaleExtent": [0.01, 5],
        "transitionSpeed": 800
    },
    "block": {
        "padding": 10,
        "header": 50,
        "pointSpacing": 10,
        "borderRadius": 0
    },
    "grid": {
        "active": false,
        "spacingX": 20,
        "spacingY": 20
    },
    "group": {
        "padding": 10,
        "header": 30,
        "borderRadius": 0,
        "minSize": [200, 150]
    },
    "point": {
        "height": 20,
        "padding": 10,
        "radius": 3
    },
    "connection": {
        "step": 50
    },
    "typeColors": {
        "default": "#ff0000",
        "Stream": "#aaaaaa",
        "String": "#aac563",
        "Text": "#aac563",
        "Number": "#5990bd",
        "Boolean": "#cc99cd",
        "Object": "#d9b762",
        "Array": "#667e7f",
        "Resource": "#ffa8c2"
    },
    "blockColors": {
        "default": "#ecf0f1",
        "Start": "#a9dbb1",
        "Step": "#f4e2a0",
        "End": "#e7a297",
        "Go": "#34495e",
        "Condition": "#3498db",
        "Repeat": "#e74c3c",
        "Assign": "#f7a200",
        "Print": "#16a085",
        "format": "#2ecc71",
        "expression": "#d35400",
        "random_range": "#8e44Ad",
        "trophy": "#f1c40f"
    }
};

export default rendererConfig;
