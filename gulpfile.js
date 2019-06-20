var gulp = require('gulp');
var sass = require('gulp-sass');
var pug = require('gulp-pug');
var browserSync = require('browser-sync').create();
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');
var inject = require('gulp-inject');
var webpack = require('webpack-stream');
var webpacklast = require('webpack');
var TerserPlugin = require('terser-webpack-plugin');
var purgecss = require('gulp-purgecss');
var cleanCSS = require('gulp-clean-css');
var svgSprite = require('gulp-svg-sprite');
var data = require('gulp-data');
var fs = require('fs');


//plumber error

gulp.task('svg', function () {
    return gulp.src('dev/svg/input/*.svg')
        .pipe(svgSprite({
            mode: {
                inline: true,
                symbol: true
            },
            shape: {
                dimension: {
                    attributes: true
                }
            },
            svg: {
                xmlDeclaration: false,
                dimensionAttributes: true,
            }
        }))
        .pipe(gulp.dest('dev/svg/output'));
})

var onError = function (err) {
    console.log(err);
};

//inject

gulp.task('inject', function () {
    return gulp.src('dist/**/*.html')
        .pipe(inject(gulp.src('./dist/**/*.css', {
            read: false
        }), {
            relative: true,
            ignorePath: 'dist',
            addRootSlash: false,
            name: 'styles'
        }))
        .pipe(inject(gulp.src('./dist/**/*.js', {
            read: false
        }), {
            relative: true,
            ignorePath: 'dist',
            addRootSlash: false,
            name: 'scripts'
        }))
        .pipe(inject(gulp.src(['./dev/svg/output/symbol/**/*.svg']), {
            starttag: '<!-- svgs:{{ext}} -->',
            transform: function (filePath, file) {
                return file.contents.toString('utf8')
            }
        }))
        .pipe(gulp.dest('dist/'))
        .pipe(browserSync.stream());
});

// SCSS

gulp.task('scss', function () {
    return gulp.src('dev/scss/style.scss')
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(
            sass({
                includePaths: [
                    'node_modules'
                ]
            })
        )
        .pipe(purgecss({
            content: ['./dist/**/*.html']
        }))
        .pipe(
            autoprefixer({
                browsers: ['last 3 versions'],
                cascade: false
            })
        )
        .pipe(
            cleanCSS()
        )
        .pipe(gulp.dest('dist/'))
});

// JS

gulp.task('js', function () {
    return gulp.src('dev/js/**/*.js')
        .pipe(webpack({
            mode: 'production',
            // mode: 'development',
            entry: {
                script: './dev/js/index.js',
            },
            output: {
                publicPath: "/dist/",
                filename: '[name].js',
                chunkFilename: '[name].js',
            },
            optimization: {
                minimizer: [
                    new TerserPlugin({
                        parallel: true,
                        extractComments: 'all',
                        terserOptions: {
                            warnings: false,
                            compress: {
                                collapse_vars: false
                            },
                            output: {
                                comments: false
                            }
                        }
                    })
                ],
                splitChunks: {
                    cacheGroups: {
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            chunks: 'initial',
                            name: 'vendor',
                            enforce: true
                        }
                    }
                }
            },
            plugins: [
                new webpacklast.ProvidePlugin({
                    $: 'jquery',
                    jQuery: 'jquery'
                })
            ],
            module: {
                rules: [{
                    test: /\.(js|jsx)$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    modules: false
                                }]
                            ]
                        }
                    }
                }],
            }
        }, webpacklast))
        .pipe(gulp.dest('./dist/'))
})

// PUG

gulp.task('pug', function () {
    return gulp.src(['dev/pug/**/*.pug', '!**/_*/**'])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(data(function(file) {
            return {
                json: JSON.parse(fs.readFileSync('./dev/json/index.json'))
            }
        }))
        .pipe(pug({
            pretty: false
        }))
        .pipe(gulp.dest('dist/'))
})

//browser sync

gulp.task('serve', function (cb) {
    browserSync.init({
        // proxy: 'http://localhost/',
        // injectChanges: true,
        server: {
            baseDir: "dist/"
        },
        open: false
    })
    cb()
})

function watchFiles() {
    gulp.watch("./dev/scss/**/*.scss", gulp.series('scss', 'inject'))
    gulp.watch("./dev/pug/**/*.pug", gulp.series('pug', 'scss', 'inject'))
    gulp.watch("./dev/js/**/*.js", gulp.series('js', 'inject'))
    gulp.watch("./dev/svg/input/*.svg", gulp.series('svg', 'inject'))
}

gulp.task('watch', watchFiles);

gulp.task('default', gulp.series('pug', 'scss', 'js', 'serve', 'inject', 'watch'));