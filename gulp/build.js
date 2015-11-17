'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});
var imageminOptipng = require('imagemin-optipng');

gulp.task('partials', function() {
    return gulp.src([
            path.join(conf.paths.app, '/**/*.html')
        ])
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe($.angularTemplatecache('templateCacheHtml.js', {
            module: 'wearska',
            root: 'app'
        }))
        .pipe(gulp.dest(conf.paths.tmp + '/partials/'));
});

gulp.task('html', ['inject', 'partials'], function() {
    var partialsInjectFile = gulp.src(path.join(conf.paths.tmp, '/partials/templateCacheHtml.js'), {
        read: false
    });
    var partialsInjectOptions = {
        starttag: '<!-- inject:partials -->',
        addRootSlash: false
    };

    var htmlFilter = $.filter('*.html' ,{restore: true});
    var jsFilter = $.filter('**/*.js' ,{restore: true});
    var cssFilter = $.filter('**/*.css' ,{restore: true});
    var assets;

    return gulp.src(path.join(conf.paths.root, 'index.html'))
        .pipe($.inject(partialsInjectFile, partialsInjectOptions))
        .pipe(assets = $.useref.assets())
        // .pipe($.rev())
        .pipe(jsFilter)
        .pipe($.ngAnnotate())
        .pipe($.uglify({
            preserveComments: $.uglifySaveLicense
        })).on('error', conf.errorHandler('Uglify'))
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        // .pipe($.csso())
        .pipe($.sourcemaps.init())
        .pipe($.minifyCss())
        .pipe($.sourcemaps.write())
        .pipe(cssFilter.restore)
        .pipe(assets.restore())
        .pipe($.useref())
        // .pipe($.revReplace())
        .pipe(htmlFilter)
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true,
            conditionals: true
        }))
        .pipe(htmlFilter.restore)
        .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
        .pipe($.size({
            title: path.join(conf.paths.dist, '/'),
            showFiles: true
        }));
});

// Only applies for fonts from bower dependencies
// Custom fonts are handled by the "other" task
gulp.task('fonts', function() {
    return gulp.src($.mainBowerFiles())
        .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
        .pipe($.flatten())
        .pipe(gulp.dest(path.join(conf.paths.dist, '/fonts/')));
});

gulp.task('other', function() {
    var fileFilter = $.filter(function(file) {
        return file.stat.isFile();
    });

    return gulp.src([
            path.join('*'),
            path.join('.htaccess'),
            path.join('!' + '/bower_components/**/*'),
            path.join('!' + '/node_modules/**/*'),
            path.join('!' + conf.paths.root, '/**/*.{html,css,js,scss,json,gitignore,bowerrc,editorconfig,.jshintrc,md}')
        ])
        .pipe(fileFilter)
        .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});

gulp.task('assets', function() {
    return gulp.src([
            path.join('assets/**/*')
        ])
        .pipe(gulp.dest(path.join(conf.paths.dist, '/assets/')));
});
gulp.task('api', function() {
    return gulp.src([
            path.join('api/**/*')
        ])
        .pipe(gulp.dest(path.join(conf.paths.dist, '/api/')));
});

gulp.task('jpgs', function() {
    return gulp.src([
            path.join(conf.paths.dist, '/uploads/**/*.jpg'),
            path.join(conf.paths.dist, '/uploads/**/*.png')
        ])
        .pipe($.imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [imageminOptipng({optimizationLevel: 3})]
            }))
    .pipe(gulp.dest(path.join(conf.paths.dist, '/uploads/processed')));
});

gulp.task('uploads', function() {
    // return gulp.src([
    //         path.join('uploads/**/*')
    //     ])
    return gulp.src([
            path.join('uploads/**/*.jpg'),
            path.join('uploads/**/*.png')
        ])
        .pipe($.imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [imageminOptipng({optimizationLevel: 3})]
            }))
        .pipe(gulp.dest(path.join(conf.paths.dist, '/uploads/')));
});

gulp.task('clean', function(done) {
    $.del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')], done);
});

gulp.task('build', ['html', 'fonts', 'other', 'api', 'uploads', 'assets']);
