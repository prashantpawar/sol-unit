#!/usr/bin/env node
/**
 * @fileOverview: sol-unit command line tool.
 * @author: Andreas Olofsson (andreas@erisindustries.com)
 */
var program = require('commander');
var fs = require('fs-extra');
var fuzzy = require('fuzzy');
var path = require('path');
var test = require('./../lib/test_runner');
var logger = require('../lib/logger');
var SolUnit = require('../lib/s_unit');
var presenter = require('./log_presenter');

var log;

var CURRENT_VERSION = '0.2.0';

// Run
main();

/**
 * Runs all tests found in the working directory. It requires a running eris-db instance to work.
 */
function main() {
    renderLogo();

    program
        .version(CURRENT_VERSION)
        .usage('[options] <test ...>')
        .option("-c, --coverage", "Calculate coverage. [default=false]")
        .option("-m, --debugMessages", "Print debugging information. [default=false]")
        .option("-r, --url <url>", "Url to blockchain client. [default='http://localhost:1337/rpc']", "http://localhost:1337/rpc")
        .option("-d, --dir <dir>", "Directory in which to do the tests. [default=current directory]", process.cwd())
        .parse(process.argv);

    if(program.debugMessages) {
        logger.setConsoleLevel('debug');
    }

    log = logger.globalLogger();

    var baseDir = program.dir;

    var tests = [];
    if(program.args.length > 0 ){
        for (var i = 0; i < program.args.length; i++ ){
            var file = program.args[i];
            if(file.length >= 4 && file.slice(-4) === ".sol"){
                file = file.slice(0, -4);
            }
            try {
                var bin = file + ".binary";
                var binPath = path.join(baseDir, bin);
                var fStats = fs.lstatSync(binPath);
                if (!fStats.isFile()) {
                    log.error(bin + " exists but is not a proper file.");
                } else {
                    var abi = file + ".abi";
                    var abiPath = path.join(baseDir, abi);
                    var f2Stats = fs.lstatSync(abiPath);
                    if (!f2Stats.isFile()) {
                        log.error(abi + " exists but is not a proper file.");
                    } else {
                        tests.push(file);
                    }
                }
            } catch (error) {
                log.error("Could not find .binary or .abi files for '" + file + "' in: " + baseDir);
            }
        }
        if (tests.length === 0){
            var files = fs.readdirSync(baseDir);
            log.error("No valid tests were found.");
            var matches = [];
            for(var i = 0; i < program.args.length; i++){
                var results = fuzzy.filter(program.args[i], files);
                var m = results.map(function(el) { return el.string; });
                matches = matches.concat(m);
            }
            matches = filterSuggestions(matches);
            if(matches.length > 0){
                var rString = "";
                for(var i = 0; i < matches.length; i++) {
                    rString += matches[i] + " ";
                }
                if(results.length > 0) {
                    console.log("Did you mean any of these: " + rString);
                }
            }
            process.exit(-3);
        }
    } else {
        var filesInDir = fs.readdirSync(baseDir);

        for (var i = 0; i < filesInDir.length; i++) {
            var file = filesInDir[i];
            if (file.indexOf('Test.binary') === -1) {
                continue;
            }
            var name = path.parse(file).name;
            if (filesInDir.indexOf(name + ".abi") === -1) {
                log.error("No json-ABI file found for test: " + name);
                process.exit(-2);
            }
            tests.push(name);
        }
        if(tests.length === 0) {
            log.error("No tests found.");
            process.exit(-3);
        }
    }

    log.debug("Tests found: ", tests);

    var url = program.url;
    var doCoverage = program.coverage;

    // TODO presenter
    var sUnit = new SolUnit();

    // Set the callbacks up.
    sUnit.on('suiteStarted', suiteStarted);
    sUnit.on('contractStarted', contractStarted);
    sUnit.on('methodsStarted', methodsStarted);
    sUnit.on('methodStarted', methodStarted);
    sUnit.on('methodDone', methodDone);
    sUnit.on('methodsDone', methodsDone);
    sUnit.on('contractDone', contractDone);
    sUnit.on('suiteDone', suiteDone);
    sUnit.start(tests, baseDir, url, doCoverage);

}

function suiteStarted(error, tests) {
    presenter.presentSuiteStarted(error, tests);
    if(error){
        process.exit(-4);
    }
}

function contractStarted(error, name) {
    presenter.presentContractStarted(error, name);
}

function methodsStarted(error, methods) {
    presenter.presentMethodsStarted(error, methods);
}

function methodStarted(methodName) {
    presenter.presentMethodStarted(methodName);
}

function methodDone(results) {
    presenter.presentMethodDone(results);
}

function methodsDone(error, contractName, stats) {
    presenter.presentMethodsDone(error, contractName, stats);
}

function contractDone(error, name) {
}

function suiteDone(stats) {

    presenter.presentSuiteDone(stats);
    // exit code is number of failed tests (0 means no tests failed).
    process.exit(stats.total - stats.successful);
}

function filterSuggestions(names){
    var newNames = [];
    for(var i = 0; i < names.length; i++) {
        newNames.push(path.parse(names[i]).name);
    }
    newNames = unique(newNames);
    var tests = [];
    for(i = 0; i < newNames.length; i++){
        var name = newNames[i];
        if(name.length > 4 && name.slice(-4) === "Test"){
            tests.push(name);
        }
    }
    return tests;

    function unique(arr) {
        var seen = {};
        return arr.filter(function(e) {
            if (seen[e])
                return;
            seen[e] = true;
            return e;
        })
    }
}

function renderLogo() {
    console.log(" ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ");
    console.log("|                      _   _         _  _                   |");
    console.log("|                     | | | |       (_)| |                  |");
    console.log("|                 ___ | | | | _ __   _ | |_                 |");
    console.log("|                / __|| | | || '_ \\ | || __|                |");
    console.log("|                \\__ \\| |_| || | | || || |_                 |");
    console.log("|                |___/ \\___/ |_| |_||_| \\__|                |");
    console.log("|                                                           |");
    console.log("|                    By: Andreas Olofsson                   |");
    console.log("|            e-mail: andreas@erisindustries.com             |");
    console.log("|                                                           |");
    console.log("*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*");
}