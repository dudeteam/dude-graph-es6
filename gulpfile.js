const gulp = require("gulp");
const rollup = require("gulp-rollup");
const eslint = require("gulp-eslint");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
const sourcemaps = require("gulp-sourcemaps");
const babel = require("rollup-plugin-babel");
const nodeResolve = require("rollup-plugin-node-resolve");

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
        .on("error", notify.onError((error) => {
            return error.message;
        }));
});

gulp.task("build", ["lint"], () => {
    return gulp.src("src/dude-graph.js")
        .pipe(rollup({
            "rollup": require("rollup"),
            "format": "umd",
            "sourceMap": true,
            "moduleName": "dudeGraph",
            "plugins": [
                babel({
                    "babelrc": false,
                    "presets": ["es2015-rollup"]
                }),
                nodeResolve({"jsnext": true})
            ],
            "acorn":{
                "allowReserved": true
            }
        }))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("dist/"));
});
