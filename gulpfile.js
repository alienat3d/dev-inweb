"use strict";

const {src, dest} = require("gulp");
const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const cssbeautify = require("gulp-cssbeautify");
const removeComments = require("gulp-strip-css-comments");
const rename = require("gulp-rename");
const sass = require("gulp-sass")(require("sass"));
const cssnano = require("gulp-cssnano");
const rigger = require("gulp-rigger");
const uglify = require("gulp-uglify");
// const plumber = require("gulp-plumber");
const image = require("gulp-image");
const del = require("del");
const panini = require("panini");
const browsersync = require("browser-sync").create();

// === //
var path = {
  build: {
    html: "dist/",
    css: "dist/assets/css/",
    images: "dist/assets/img/",
    js: "dist/assets/js/",
  },
  src: {
    html: "src/*.html",
    css: "src/assets/sass/style.scss",
    images: "src/assets/img/**/*.{jpeg,jpg,png,svg,gif,ico,webmanifest,xml}",
    js: "src/assets/js/*.js",
  },
  watch: {
    html: "src/**/*.html",
    css: "src/assets/sass/**/*.scss",
    images: "src/assets/img/**/*.{jpeg,jpg,png,svg,gif,ico,webmanifest,xml}",
    js: "src/assets/js/**/*.js",
  },
  clean: "./dist",
};
// = Tasks = //
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./dist/",
    },
    port: 3000,
    notify: false
  });
}

function browserSyncReload(done) {
  browsersync.reload();
}

function html() {
  panini.refresh();
  return src(path.src.html, { base: "src/" })
    // .pipe(plumber())
    .pipe(
      panini({
        root: "src/",
        layouts: "src/templates/layouts/",
        partials: "src/templates/partials/",
        helpers: "src/templates/helpers/",
        data: "src/templates/data/",
      })
    )
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function css() {
  return src(path.src.css, { base: "src/assets/sass/" })
    // .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer({
        overrideBrowserslist: ["last 10 versions"],
        cascade: true,
      })
    )
    .pipe(cssbeautify())
    .pipe(dest(path.build.css))
    .pipe(cssnano({
        zindex: false,
        discardComments: {
          removeAll: true,
        },
      })
    )
    .pipe(removeComments())
    .pipe(rename({
        suffix: ".min",
        extname: ".css",
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

function js() {
  return src(path.src.js, {base: './src/assets/js/'})
    // .pipe(plumber())
    .pipe(rigger())
    .pipe(gulp.dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({
        suffix: '.min',
        extname: '.js'
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

function images() {
  return src(path.src.images)
    .pipe(
      image({
        optipng: ["-i 1", "-strip all", "-fix", "-o7", "-force"],
        pngquant: ["--speed=1", "--force", 256],
        zopflipng: ["-y", "--lossy_8bit", "--lossy_transparent"],
        jpegRecompress: [
          "--strip",
          "--quality",
          "medium",
          "--min",
          40,
          "--max",
          80,
        ],
        mozjpeg: ["-optimize", "-progressive"],
        gifsicle: ["--optimize"],
        svgo: ["--enable", "cleanupIDs", "--disable", "convertColors"],
      })
    )
    .pipe(dest(path.build.images));
}

function clean() {
  return del(path.clean);
}

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.images], images);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images));
const watch = gulp.parallel(build, watchFiles, browserSync);

// = Exports Tasks = //
exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;