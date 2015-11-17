'use strict';

var path = require('path');
var gulp = require('gulp');
var watch = require('gulp-watch');
var conf = require('./conf');

var browserSync = require('browser-sync');

function isOnlyChange(event) {
    return event.type === 'changed';
}

function isAdded(file) {
    return file.event === 'add';
}
gulp.task('watch', ['inject'], function() {

    gulp.watch(['bower.json'], ['inject']);

    watch([
        // path.join(conf.paths.app, '/**/*.css'),
        path.join(conf.paths.app, '/**/*.scss')
    ], function(event) {
        if (isAdded(event)) {
            gulp.start('inject');
            browserSync.reload;
        } else {
            gulp.start('styles');
        }
    });

    watch([
            path.join(conf.paths.app, '*.html'),
            path.join(conf.paths.app, '/**/*.html'),
            path.join('index.html')
        ],
        function() {
            browserSync.reload;
        }
    );

    watch([
        path.join(conf.paths.app, '/**/*.js'),
        path.join(conf.paths.app, 'scripts/**/*.js'),
        path.join(conf.paths.app, 'views/**/*.js'),
        path.join(conf.paths.app, 'components/**/*.js')
    ], function(event) {
        if (isAdded(event)) {
            gulp.start('inject');
        } else {
            gulp.start('scripts');
        }
        browserSync.reload;
    });

});