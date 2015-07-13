var gulp = require('gulp');
var gDebug = require('gulp-debug');
var gUtil = require('gulp-util');
var path = require('path');
var del = require('del');
var fs = require('fs-extra');
var gsm = require('gulp-smake');
var os = require('os');

var options = require('./contracts.json');
var exports = {};

var buildDir = path.join(options.root, options.buildDir);
var docsDir = path.join(options.root, options.docsDir);

// Just some debugging info. Enable if the SOL_UNIT_BUILD_DEBUG envar is set.
var debugMode = true; // process.env.SOL_UNIT_BUILD_DEBUG;
var dbg;
if(debugMode){
    dbg = gDebug;
} else {
    dbg = gUtil.noop;
}

// TODO start separating tasks into different files.

// Removes the build folder.
gulp.task('contracts-clean', function(cb) {
    del([buildDir, docsDir], cb);
});

// Used to set up the project for building.
gulp.task('contracts-init-build', function (cb) {
    del([buildDir, docsDir], cb);
});

// Writes the complete source tree to a temp folder. This is also where external source dependencies
// would be fetched and set up if needed.
gulp.task('contracts-pre-build', ['contracts-init-build'], function(){
    // Create an empty folder in temp to use as temporary root when building.
    var temp = path.join(os.tmpdir(), "sol-unit");
    fs.emptyDirSync(temp);
    // Modify the source folder in the object, so that it uses the new temp folder.
    exports.base = temp;
    // Create the path to the root source folder.
    var base = path.join(options.root, options.sourceDir);
    return gulp.src(options.paths, {base: base})
        .pipe(dbg())
        .pipe(gulp.dest(temp));
});

// Compiles the contracts. This is also where external code dependencies would be set up and built if needed.
gulp.task('contracts-build', ['contracts-pre-build'], function () {
        return gulp.src(exports.base + '/**/*')
            .pipe(dbg())
            .pipe(gsm.build(options, exports));
});

// Any cleanup of the build directory is put here.
gulp.task('contracts-post-build', ['contracts-build'], function(cb){
    del([path.join(buildDir,'Asserter.*'), path.join(docsDir,'Asserter.*')], cb);
});

// Build the contracts project.
gulp.task('build-contracts', ['contracts-post-build']);

// Gather up all sources in a temp folder. This is useful if a project needs the
// sources from this project but not the compiled files.
gulp.task('export-contracts', ['contracts-pre-build']);

// Default is to build the contracts.
gulp.task('default', ['build-contracts']);