/*eslint-env node*/

const gulp = require("gulp");
const rollup = require("gulp-rollup");
const eslint = require("gulp-eslint");
const notify = require("gulp-notify");
const rename = require("gulp-rename");
const plumber = require("gulp-plumber");
const sourcemaps = require("gulp-sourcemaps");

const babel = require("rollup-plugin-babel");
const nodeResolve = require("rollup-plugin-node-resolve");

const DUDE_GRAPH_SOURCES = ["src/*.js", "src/**/*.js"];
const rollupNode = {
    "sourceMap": true,
    "plugins": [
        nodeResolve()
    ]
};
const rollupWeb = {
    "format": "iife",
    "sourceMap": true,
    "moduleName": "dudeGraph",
    "plugins": [
        babel({
            "presets": ["es2015-rollup"],
            "babelrc": false
        }),
        nodeResolve()
    ]
};

gulp.task("default", ["build:es5", "build:es6"]);

gulp.task("watch", ["default"], () => {
    gulp.watch(DUDE_GRAPH_SOURCES, ["default"]);
});

gulp.task("lint", () => {
    return gulp.src(DUDE_GRAPH_SOURCES)
        .pipe(eslint())
        .pipe(plumber())
        .pipe(eslint.format("node_modules/eslint-clang-formatter", process.stdout))
        .pipe(eslint.failAfterError())
        .on("error", notify.onError((error) => {
            return error.message;
        }));
});

gulp.task("build:es5", ["lint"], () => {
    return gulp.src("src/dude-graph.js")
        .pipe(rollup(rollupWeb))
        .pipe(rename("dude-graph.js"))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("."));
});

gulp.task("build:es6", ["lint"], () => {
    return gulp.src("src/dude-graph.js")
        .pipe(rollup(rollupNode))
        .pipe(rename("dude-graph-es6.js"))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("."));
});
