const gulp = require("gulp");
const rollup = require("gulp-rollup");
const eslint = require("gulp-eslint");
const notify = require("gulp-notify");
const rename = require("gulp-rename");
const plumber = require("gulp-plumber");
const sourcemaps = require("gulp-sourcemaps");
const babel = require("rollup-plugin-babel");
const nodeResolve = require("rollup-plugin-node-resolve");

const sources = ["src/*.js", "src/**/*.js"];
const es5config = {
    "format": "umd",
    "sourceMap": true,
    "moduleName": "dudeGraph",
    "plugins": [
        babel({
            "presets": ["es2015-rollup"],
            "babelrc": false,
            "sourceMap": true
        }),
        nodeResolve()
    ]
};
const es6config = {
    "sourceMap": true,
    "plugins": [
        nodeResolve()
    ]
};

gulp.task("default", ["build:es5", "build:es6"]);

gulp.task("watch", ["default"], () => {
    gulp.watch(sources, ["default"]);
});

gulp.task("lint", () => {
    return gulp.src(sources)
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
        .pipe(rollup(es5config))
        .pipe(rename("dude-graph.js"))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("."));
});

gulp.task("build:es6", ["lint"], () => {
    return gulp.src("src/dude-graph.js")
        .pipe(rollup(es6config))
        .pipe(rename("dude-graph-es6.js"))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("."));
});
