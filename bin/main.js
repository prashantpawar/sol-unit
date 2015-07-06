#!/usr/bin/env node
/**
 * @fileOverview: solUnit command line tool.
 * @author: Andreas Olofsson (andreas@erisindustries.com)
 */
var program = require('commander');
var fs = require('fs-extra');
var path = require('path');
var test = require('./../lib/test_runner');
var logger = require('../lib/logger');
var sol_unit = require('../lib/sol_unit');

var log = logger.globalLogger();

// Run
main();

function main() {
    renderLogo();
    program
        .version('0.1.0')
        .usage('[options] <file ...>')
        .option("-c, --coverage", "Calculate coverage. Default: is 'false'")
        .option("-d, --debugMessages", "Get debugging messages. Default: is 'false'")
        .option("-r, --rpcUrl", "Url to blockchain client. Default is: 'http://localhost:1337'")
        .parse(process.argv);

    if (program.debugMessages) {
        logger.setConsoleLevel('debug');
    }

    var cwd = process.cwd();

    var filesInDir = fs.readdirSync(cwd);
    var tests = [];
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
    if (tests.length === 0) {
        log.error("No tests found.");
        process.exit(-3);
    }
    log.debug("Tests found: ", tests);
    var url = program.rpcUrl || 'http://localhost:1337/rpc';


    var doCoverage = program.coverage || false;

    sol_unit.start(tests, url, doCoverage, function(error, stats){
        if (!error) {
            var successful = 0, total = 0;
            for(var o in stats){
                // Shut linter up...
                if(stats.hasOwnProperty(o)) {
                    var data = stats[o];
                    successful += data.successful;
                    total += data.total;
                }
            }
            console.log("");
            console.log("Results: " + successful + " tests out " + total + " succeeded.");
            console.log("");
            log.debug("Process exiting normally.");
            // exit code is number of failed tests (0 means no tests failed).
            process.exit(stats.total - stats.successful);
        } else {
            log.debug("Process exiting with an error: ", error);
            process.exit(-5);
        }

    });

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