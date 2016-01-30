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
var solUnit = require('./index');
var path = require('path');
var version = require('./lib/version.json');

var tests = ['ArrayTest', 'BankTest', 'BasicTypesTest', 'CoinTest', 'DemoTest', 'GlobalsTest', 'IndirectionTest', 'StructsTest', 'WrapsInternalTest', 'LibTest'];
var testFolder = path.join(__dirname, 'contracts', 'build', 'test');

// ********************** version **********************

gulp.task('version-bump', function(){
    gulp.src(['./package.json'])
        .pipe(replace(/"version":\s*"\d+(\.\d+){2}"/, '"version": "'+ version.version + '"'))
        .pipe(gulp.dest('./'));
    gulp.src(['./bin/solunit.js'])
        .pipe(replace(/CURRENT_VERSION\s*=\s*'\d+(\.\d+){2}'/, "CURRENT_VERSION = '" + version.version + "'"))
        .pipe(gulp.dest('./bin/'));

});

// ********************** contracts **********************

gulp.task('clean-contracts', function(cb) {
    process.exec('rm -rf build', {cwd: './contracts'}, function (error) {
        cb(error);
    });
});

gulp.task('build-contracts', function(cb) {
    process.exec('./build_contracts.sh', function (error) {
        if(error) return cb(error);
    });
});

gulp.task('test-contracts', function(cb) {
    solUnit.runTests(tests, testFolder, true, function(stats){
        cb();
    });
});

// Default is to build the contracts.
gulp.task('default', ['build-contracts']);