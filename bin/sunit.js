#!/usr/bin/env node
/**
 * @fileOverview: solUnit command line tool.
 * @author: Andreas Olofsson (andreas@erisindustries.com)
 */
var program = require('commander');
var fs = require('fs-extra');
var fuzzy = require('fuzzy');
var path = require('path');
var test = require('./../lib/test_runner');
var logger = require('../lib/logger');
var SolUnit = require('../lib/sol_unit');
var presenter = require('./log_presenter');

var log = logger.globalLogger();

// Run
main();

/**
 * Runs all tests found in the working directory. It requires a running eris-db instance to work.
 */
function main() {
    renderLogo();
    program
        .version('0.1.4')
        .usage('[options] <file ...>')
        .option("-c, --coverage", "Calculate coverage.", "false")
        .option("-d, --debugMessages", "Print debugging info.", "false")
        .option("-r, --rpcUrl", "Url to blockchain client.", "http://localhost:1337")
        .parse(process.argv);

    if (program.debugMessages) {
        logger.setConsoleLevel('debug');
    }

    var tests = [];
    var cwd = process.cwd();
    if(program.args.length > 0 ){
        for (var i = 0; i < program.args.length; i++ ){
            var file = program.args[i];
            if(file.length >= 4 && file.slice(-4) === ".sol"){
                file = file.slice(0, -4);
            }
            try {
                var bin = file + ".binary";
                var binPath = path.join(cwd, bin);
                var fStats = fs.lstatSync(binPath);
                if (!fStats.isFile()) {
                    log.error(bin + " exists but is not a proper file.");
                } else {
                    var abi = file + ".abi";
                    var abiPath = path.join(cwd, bin);
                    var f2Stats = fs.lstatSync(abiPath);
                    if (!f2Stats.isFile()) {
                        log.error(abi + " exists but is not a proper file.");
                    } else {
                        tests.push(file);
                    }
                }
            } catch (error) {
                log.error("Could not find .binary or .ast files for '" + file + "' in the current directory");
            }
        }
        if (tests.length === 0){
            var files = fs.readdirSync(cwd);
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
        var filesInDir = fs.readdirSync(cwd);

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

    var url = program.rpcUrl;

    var doCoverage = program.coverage;
    // TODO presenter
    var sUnit = new SolUnit();

    // Set the callbacks up. We don't need to listen to all events.
    sUnit.on('suiteStarted', suiteStarted);
    sUnit.on('contractStarted', contractStarted);
    sUnit.on('methodsStarted', methodsStarted);
    sUnit.on('methodsDone', methodsDone);
    sUnit.on('contractDone', contractDone);
    sUnit.on('suiteDone', suiteDone);

    sUnit.start(tests, url, doCoverage);

}

function suiteStarted(tests) {
    presenter.presentSuiteStarted(tests);
}

function contractStarted(error, name) {
    presenter.presentContractStarted(error, name);
}

function methodsStarted(error, methods) {
    presenter.presentMethodsStarted(error, methods);
}

function methodsDone(error, contractName, stats) {
    presenter.presentMethodsDone(error, contractName, stats);
}

function contractDone(error, name) {
}

function suiteDone(stats) {
    var successful = 0, total = 0;

    for (var o in stats) {
        // Shut linter up...
        if (stats.hasOwnProperty(o)) {
            var data = stats[o].testResults;
            for(var i = 0; i < data.length; i++){
                var tr = data[i].result;
                if(tr) {
                    successful += 1;
                }
                total += 1;
            }
        }
    }
    presenter.presentSuiteDone(successful, total);
    log.debug("Process exiting normally.");
    // exit code is number of failed tests (0 means no tests failed).
    process.exit(total - successful);
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