/**
 * @file sol_unit.js
 * @fileOverview This is the main library module.
 * @author Andreas Olofsson (androlo1980@gmail.com)
 * @module sol_unit
 */
'use strict';

var events = require('events');
var nUtil = require('util');
var fs = require('fs-extra');
var TestRunner = require('./test_runner');
var logger = require('./logger');
var path = require('path');
var Program = require('./chain/program');

var log = logger.globalLogger();

module.exports = SUnit;

/**
 * This class runs tests on a list of provided test contracts. Communicates with the caller through events.
 * These are the identifiers:
 *
 * - suiteStarted - the entire suite is started. params: error, tests - array of test names.
 * - suiteDone - suite is done. params: stats - collection of stats for all test contracts.
 * - contractStarted - The next contract test is starting. params: error, testName - the test name.
 * - contractDone - A contract is done. params: error
 * - methodsStarted - The test methods in a contract is being run. params: funcs - list of test functions
 * - methodsDone - The methods is done and the results (or error) is in. params: error, stats - the test results.
 * - methodStarted - A particular test-method in a contract is being run. params: name - the method name.
 * - methodDone - A particular method is done. params: results - the test results.
 *
 * Suite started is fired as soon as the class is provided with a list of tests. Then, for each contract
 * In the suite it will do 'contractStarted -> methodsStarted -> methodsDone -> contractDone'.
 *
 * The distinction between contractStarted and methodsStarted is important. When a contract is started
 * it needs to be deployed before the methods can be run, meaning it's a two-stage process. Each contract
 * needs to wait for two commits - the first one is of the test contract, and the second is of the test
 * method transactions. The transactions are done all at once to save time. It's a 10-15 second wait for
 * each commit by default, meaning each contract will take about 2 times that, rather then the multiplier
 * being (1 + numberOfTests). This might change later depending on how the eris-db/tendermint client evolves.
 *
 * Errors will not stop the process. If a contract cannot be tested it will be skipped, and an error is
 * emitted.
 *
 * @constructor
 */
function SUnit() {
    // Mostly just forward declarations.
    this._curTest = 0;
    this._tests = null;
    this._stats = null;
    events.EventEmitter.call(this);
}

nUtil.inherits(SUnit, events.EventEmitter);

/**
 * Run unit tests.
 *
 * @param {string[]} tests - a list of test names. These would all be on the form '*Test': ['ArraysTest', 'CoinTest', ... ]
 * @param {string} baseDir - the directory in which to look for the compiled solidity files.
 * the tests, and '.abi' files of the contracts that are being tested.
 */
SUnit.prototype.start = function (tests, baseDir) {
    this._baseDir = baseDir;
    this._tests = tests;
    this._stats = {testUnits: {}, skippedUnits: {}};
    this.emit('suiteStarted', null, tests);
    this.runContract();

};

/**
 * Start the next contract tests.
 */
SUnit.prototype.runContract = function () {
    // If there are no more contracts to run, the suite is done.
    if (this._curTest === this._tests.length) {
        this.suiteDone();
        return;
    }

    var testName = this._tests[this._curTest++];

    var binFile = path.join(this._baseDir, testName + ".bin");
    var abiFile = path.join(this._baseDir, testName + ".abi");

    var bin, abi, err;
    try {
        bin = '0x' + fs.readFileSync(binFile).toString();
        abi = fs.readJsonSync(abiFile);
    } catch (error) {
        // If we can't load files,
        err = error;
    }

    if (err) {
        this._stats.skippedUnits[testName] = err.message;
        this.emit('contractStarted', err, testName);
        return this.runContract();
    }

    this.emit('contractStarted', null, testName);

    var that = this;

    var test = new TestRunner(testName, bin, abi, new Program(this._baseDir));

    // Some logic to forward events from the testrunner (so that caller can subscribe to
    // all events from here), and some test-data processing.
    test.once('methodsStarted', function (error, methods) {
        that.emit('methodsStarted', error, methods);
        // If methods failed to start we move on directly to the next contract.
        if (error) {
            that.runContract();
        }
    });

    test.once('methodsDone', function (error, testName, stats) {
        if (error) {
            that.emit('methodsDone', error, testName, stats);
        } else {
            var data = stats;
            that._stats.testUnits[testName] = data;
            that.emit('methodsDone', error, testName, data);
            that.emit('contractDone');
        }

        // Run the next contract.
        that.runContract();
    });

    test.on('methodStarted', function (name) {
        that.emit('methodStarted', name)
    });

    test.on('methodDone', function (res) {
        that.emit('methodDone', res)
    });

    test.run();
};

SUnit.prototype.suiteDone = function () {
    var successful = 0, total = 0;
    var stats = this._stats;
    var testUnits = stats.testUnits;

    for (var o in testUnits) {
        // Shut linter up...
        if (testUnits.hasOwnProperty(o)) {
            var data = testUnits[o];
            for (var p in data) {
                if (data.hasOwnProperty(p)) {
                    var tr = data[p].result;

                    if (tr) {
                        successful += 1;
                    }
                    total += 1;
                }
            }
        }
    }
    stats.successful = successful;
    stats.total = total;

    var testUnitsRun = Object.keys(testUnits).length;
    var testUnitsSkipped = Object.keys(stats.skippedUnits).length;
    stats.numTestUnits = testUnitsRun + testUnitsSkipped;
    stats.numSkippedUnits = testUnitsSkipped;
    this.emit('suiteDone', stats);
};