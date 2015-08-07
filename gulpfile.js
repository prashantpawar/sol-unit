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
 *   |            e-mail: andreas@erisindustries.com             |
 *   |                                                           |
 *   *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 *
 *
 * Some of the tasks uses sub-tasks that are defined in other files.
 * Those files can all be found inside the 'gulp-tasks' directory.
 *
 */

var gulp = require('gulp');
var replace = require('gulp-replace');

require('require-dir')('./gulp-tasks');

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

// Build the contracts project.
gulp.task('build-contracts', ['contracts-post-build']);

// Gather up all sources in a temp folder. This is useful if a project needs the
// sources from this project but not the compiled files.
gulp.task('export-contracts', ['contracts-pre-build']);

// Default is to build the contracts.
gulp.task('default', ['build-contracts']);