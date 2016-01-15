/*
 *    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *   |                      _   _         _  _                   |
 *   |                     | | | |       (_)| |                  |
 *   |                 ___ | | | | _ __   _ | |_                 |
 *   |                / __|| | | || '_ \ | || __|                |
 *   |                \__ \| |_| || | | || || |_                 |
 *   |                |___/ \___/ |_| |_||_| \__|                |
 *   |                                                           |
 *   |                    By: Andreas Olofsson                   |
 *   |                e-mail: androlo1980@gmail.com              |
 *   |                                                           |
 *   *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 *
 */

var gulp = require('gulp');
var replace = require('gulp-replace');
var process = require('child_process');

var version = require('./lib/version.json');

// ********************** version **********************

gulp.task('version-bump', function(){
    gulp.src(['./package.json'])
        .pipe(replace(/"version":\s*"\d+(\.\d+){2}"/, '"version": "'+ version.version + '"'))
        .pipe(gulp.dest('./'));
    gulp.src(['./bin/sunit.js'])
        .pipe(replace(/CURRENT_VERSION\s*=\s*'\d+(\.\d+){2}'/, "CURRENT_VERSION = '" + version.version + "'"))
        .pipe(gulp.dest('./bin/'));

});

// ********************** contracts **********************

gulp.task('clean-contracts', function(cb) {
    process.exec('make clean', {cwd: './contracts'}, function (error) {
        cb(error);
    });
});

gulp.task('build-contracts', function(cb) {
    process.exec('make clean', {cwd: './contracts'}, function (error) {
        if(error) return cb(error);
        process.exec('make', {cwd: './contracts'}, function (error) {
            cb(error);
        });
    });
});

// Default is to build the contracts.
gulp.task('default', ['build-contracts']);