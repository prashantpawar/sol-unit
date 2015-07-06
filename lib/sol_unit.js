/**
 * @file sol_unit.js
 * @fileOverview This is the main library module.
 * @author Andreas Olofsson (andreas@erisindustries.com)
 * @module sol_unit
 */
'use strict';

var async = require('async');
var fs = require('fs-extra');
var edbModule = require('eris-db');
var eris = require('eris-contracts');
var coverage = require('./coverage');
var TestRunner = require('./test_runner');
var logger = require('./logger');

var log = logger.globalLogger();
var testLog = logger.testLogger();

exports.start = function (tests, url, doCoverage, callback) {
    var privKey = "6B72D45EB65F619F11CE580C8CAED9E0BADC774E9C9C334687A65DCBAD2C4151CB3688B7561D488A2A4834E1AEE9398BEF94844D8BDBBCA980C11E3654A45906";
    log.debug("Using eris-db endpoint: " + url);
    var edb = edbModule.createInstance(url);
    var pipe = new eris.pipes.DevPipe(edb, privKey);
    var contracts = eris.solidityContracts(pipe);

    // Some stats.
    var stats = {};

    async.eachSeries(tests, function (testName, cb) {

        var binFile = testName + ".binary";
        var abiFile = testName + ".abi";
        var code, abi;
        try {
            code = fs.readFileSync(binFile).toString();
            abi = fs.readJsonSync(abiFile);
        } catch (error) {
            log.error("Failed to load files: ", error);
            process.exit(-4);
        }

        var contractFactory = contracts(abi);
        console.log("");
        testLog.header("Starting: " + testName);
        testLog.info("Deploying contract. This normally takes between 10 and 20 seconds.");
        contractFactory.new({data: code}, function (error, contract) {
            if (error) {
                log.error("Failed to deploy contract for test: ", testName);
                callback(error);
                return;
            }
            var test = new TestRunner(contract);
            test.run(function (error, data) {
                if (error) {
                    cb(error);
                } else {
                    stats[testName] = data;
                    if (doCoverage) {
                        var astFile = testName + ".ast";
                        var testeeAbiFile = testName.slice(0, -4) + ".abi";
                        try {
                            var testAst = fs.readJsonSync(astFile);
                            var testeeAbi = fs.readJsonSync(testeeAbiFile);
                            var results = coverage.analyze(testName, testAst, testeeAbi);

                            presentCoverage(results);
                        } catch (error) {
                            log.error("Failed to do coverage analysis. Skipping.");
                            log.error(error);
                        }
                    }
                    cb();
                }
            })
        });
    }, function (error) {
        if (error) {
            callback(error);
        } else {
            callback(null, stats);
        }
    });

};

function presentCoverage(coverage) {
    var covered = 0;
    for(var i = 0; i < coverage.length; i++){
        covered += coverage[i].covered ? 1 : 0;
    }
    // Percentage.
    var p = (covered / coverage.length)*100;

    testLog.header("Coverage report:");
    if (p < 55) {
        testLog.fail("Coverage: %d %", p.toFixed(2));
    } else if (coverage.percent < 90) {
        testLog.moderate("Coverage: %d %", p.toFixed(2));
    } else {
        testLog.success("Coverage: %d %", p.toFixed(2));
    }
    console.log('');
    testLog.info("Covered methods:");
    for (i = 0; i < coverage.length; i++) {
        var f = coverage[i];
        var tested = f.covered;
        if (tested) {
            testLog.success("%s", f.func);
        } else {
            testLog.fail("%s", f.func);
        }
    }
}