const gulp = require("gulp");
const rollup = require("gulp-rollup");
const eslint = require("gulp-eslint");
const notify = require("gulp-notify");
const rename = require("gulp-rename");
const plumber = require("gulp-plumber");
const sourcemaps = require("gulp-sourcemaps");

const sources = ["src/*.js", "src/**/*.js"];

gulp.task("default", ["build"]);

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

gulp.task("build", ["lint"], () => {
    return gulp.src("src/dude-graph.js")
        .pipe(rollup({
            "sourceMap": true
        }))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("dist/"));
});
