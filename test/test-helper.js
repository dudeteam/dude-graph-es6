require("babel-core/register")({
    // Tells babel to transpile lodash-es and event-class-es6
    "ignore": /node_modules\/(?!lodash-es|event-class-es6)/
});
