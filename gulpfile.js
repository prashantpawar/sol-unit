var gulp = require('gulp');
var path = require('path');
var fs = require('fs-extra');
var cp = require('child_process');
var os = require('os');

// TODO Standardize this eventually.
gulp.task('build-contracts', function (done) {

    var globals = {
        root: "./contracts",
        srcDir: "./contracts/src",
        includes: ["./contracts/include"],
        buildDir: "./contracts/build"
    };

    var exports = {};

    var solc = "solc";
    var osName = os.platform();
    if (osName.indexOf('win') === 0) {
        solc = solc + '.exe';
    }

    preBuild();

    function preBuild() {
        // Make sure solc exists on path.
        run(solc + ' --version', null, function (error) {
            if (error) {
                console.log("solc error: " + error);
                process.exit(-1);
            }

            try {
                var tmp = path.join(os.tmpDir(), "_soltemp");

                fs.emptyDirSync(tmp);

                fs.copySync(globals.srcDir, tmp);
                // Copy includes into root, with subfolders and all.
                if (globals.includes) {
                    for (var i = 0; i < globals.includes.length; i++) {
                        fs.copySync(globals.includes[i], tmp);
                    }
                }

                exports.tmpDir = tmp;
            } catch (error) {
                console.log("pre-build error: " + error);
                process.exit(-1);
            }
            build();
        });
    }

    function build() {
        var args = "--optimize 1 --binary file --json-abi file --ast-json file --input-file";
        var sources = [];
        // Cheating by just adding all within a dir.
        addAllSources(sources, "");
        addAllSources(sources, "assertions");

        var buildDir = globals.buildDir;
        fs.removeSync(buildDir);
        fs.mkdirpSync(buildDir);
        exports.sources = sources;

        for (var i = 0; i < sources.length; i++) {
            args += ' ' + sources[i];
        }

        var cmd = solc + ' ' + args;
        console.log(cmd);
        run(cmd, {cwd: exports.tmpDir}, function (error) {

            if (error) {
                console.log("build error: " + error);
                fs.removeSync(exports.tmpDir);
                process.exit(-2);
            }
            postBuild();
        })
    }

    function postBuild() {
        var sources = exports.sources;
        for (var i = 0; i < sources.length; i++) {
            var sName = sources[i];
            var name = path.basename(sName).slice(0, -4);
            var bin = name + ".binary";
            var abi = name + ".abi";
            var ast = name + ".ast";
            // TODO This it temporary since -o (output dir) flag is not added to Solc yet, and we want to build from the source dir.
            var binPath = path.join(exports.tmpDir, bin);
            var abiPath = path.join(exports.tmpDir, abi);
            var astPath = path.join(exports.tmpDir, ast);
            if (name.length >= 4 && name.slice(-4) === "Test") {
                console.log("Moving: " + name);
                fs.renameSync(binPath, path.join(globals.buildDir, bin));
                fs.renameSync(abiPath, path.join(globals.buildDir, abi));
                fs.renameSync(astPath, path.join(globals.buildDir, ast));
                // Move abi file for testee as well, for coverage tests.
                var tAbiName = name.slice(0, -4) + ".abi";
                fs.renameSync(path.join(exports.tmpDir, tAbiName), path.join(globals.buildDir, tAbiName));
            }
        }
        fs.removeSync(exports.tmpDir);
        done();
    }

    function run(cmd, options, callback) {
        var exec = cp.exec;
        var opts = options || {};
        exec(cmd, opts, function (error, stdout) {
            callback(error, stdout);
        });
    }

    function addAllSources(sources, subdir) {
        var pt = path.join(exports.tmpDir, subdir);
        console.log(pt);
        var filesInDir = fs.readdirSync(pt);
        console.log(filesInDir);
        for (var i = 0; i < filesInDir.length; i++) {
            var file = filesInDir[i];
            if (file.indexOf(".sol") !== -1) {
                var fp;
                if (!subdir) {
                    fp = file;
                } else {
                    fp = path.join(subdir, file);
                }
                sources.push(fp);
            }
        }
    }

    function addSource(sources, file) {
        sources.push(file);
    }

});