'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var php = require('gulp-connect-php');
var browserSync = require('browser-sync');
var browserSyncSpa = require('browser-sync-spa');

browserSync.use(browserSyncSpa({
    selector: '[ng-app]' // Only needed for angular apps
}));
gulp.task('php', function() {
    php.server({ base: './', port: 8010, keepalive: true});
});
gulp.task('serve', ['php', 'watch'], function() {
    browserSync.init({
        server: {
            baseDir: "./",
            proxy: '127.0.0.1:8010',
            port: 8080,
            open: true,
            notify: false,
            middleware: function(req, res, next) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                next();
            }
        }
    });
    gulp.watch("app/*.html").on('change', browserSync.reload);
    gulp.watch("app/**/*.html").on('change', browserSync.reload);
    gulp.watch("index.html").on('change', browserSync.reload);
});