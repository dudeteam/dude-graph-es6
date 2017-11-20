const gulp = require("gulp");
const eslint = require("gulp-eslint");
const uglify = require("gulp-uglify");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
const sourcemaps = require("gulp-sourcemaps");
const rollup = require("rollup-stream");
const babel = require("rollup-plugin-babel");
const nodeResolve = require("rollup-plugin-node-resolve");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");

const sources = ["src/*.js", "src/**/*.js"];

gulp.task("default", ["build"]);

gulp.task("watch", ["build"], () => {
    gulp.watch(sources, ["build"]);
});

gulp.task("lint", () => {
    return gulp.src(sources)
        .pipe(eslint())
        .pipe(plumber())
        .pipe(eslint.format("node_modules/eslint-clang-formatter", process.stdout))
        .pipe(eslint.failAfterError())
        .on("error", notify.onError(error => {
            return error.message;
        }));
});

gulp.task("build", ["lint"], () => {
    return rollup({
        "input": "./src/dude-graph.js",
        "sourcemap": true,
        "format": "umd",
        "name": "dudeGraph",
        "plugins": [
            babel({
                "babelrc": false,
                "presets": [["es2015", {"modules": false}]],
                "plugins": ["external-helpers"]
            }),
            nodeResolve({"jsnext": true})
        ]
    })
        .pipe(source("dude-graph.js", "src"))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("dist"));
});
