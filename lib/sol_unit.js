/**
 * @file sol_unit.js
 * @fileOverview This is the main library module.
 * @author Andreas Olofsson (andreas@erisindustries.com)
 * @module sol_unit
 */
'use strict';

var events = require('events');
var nUtil = require('util');
var fs = require('fs-extra');
var edbModule = require('eris-db');
var eris = require('eris-contracts');
var coverage = require('./coverage');
var TestRunner = require('./test_runner');
var logger = require('./logger');

var log = logger.globalLogger();

module.exports = SolUnit;

/**
 * This class runs tests on a list of provided test contracts. Communicates with the caller through events.
 * These are the identifiers:
 *
 * - suiteStarted - the entire suite is started. params: tests - array of test names.
 * - suiteDone - suite is done. params: stats - collection of stats for all test contracts.
 * - contractStarted - The next contract test is starting. params: error, testName - the test name.
 * - contractDone - A contract is done. params: error
 * - methodsStarted - The test methods in a contract is being run. params: funcs - list of test functions
 * - methodsDone - The methods is done and the results (or error) is in. params: error, stats - the test results.
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
function SolUnit() {
    // Mostly just forward declarations. Like to put it all in constructor.
    this._curTest = 0;
    this._contracts = null;
    this._tests = null;
    this._stats = null;
    this._coverage = false;
    events.EventEmitter.call(this);
}

nUtil.inherits(SolUnit, events.EventEmitter);

SolUnit.prototype.start = function (tests, url, doCoverage) {
    var privKey = "6B72D45EB65F619F11CE580C8CAED9E0BADC774E9C9C334687A65DCBAD2C4151CB3688B7561D488A2A4834E1AEE9398BEF94844D8BDBBCA980C11E3654A45906";
    log.debug("Using eris-db endpoint: " + url);
    var edb = edbModule.createInstance(url);
    var pipe = new eris.pipes.DevPipe(edb, privKey);
    this._contracts = eris.solidityContracts(pipe);
    this._tests = tests;
    this._stats = {};
    this._coverage = doCoverage;
    this.emit('suiteStarted', tests);
    this.runContract();
};

/**
 * Start the next contract tests.
 */
SolUnit.prototype.runContract = function () {
    // If there are no more contracts to run, the suite is done.
    if(this._curTest === this._tests.length){
        this.emit('suiteDone', this._stats);
        return;
    }

    var testName = this._tests[this._curTest++];

    var binFile = testName + ".binary";
    var abiFile = testName + ".abi";

    var code, abi;
    try {
        code = fs.readFileSync(binFile).toString();
        abi = fs.readJsonSync(abiFile);
    } catch (error) {
        // If we can't load files,
        log.error("Failed to load files: ", error);
        this.emit('contractStarted', error, testName);
        this.runContract();
        return;
    }
    this.emit('contractStarted', null, testName);
    var that = this;

    this._contracts(abi).new({data: code}, function (error, contract) {
        if (error) {
            log.error("Failed to deploy contract for test: ", testName);
            that.emit('contractDone', error, testName);
            // We have an unsuccessful contract test because the contract failed to deploy for some reason.
            // Move on to the next.
            that.runContract();
            return;
        }
        var test = new TestRunner(testName, contract);
        test.once('methodsStarted', that.methodsStarted.bind(that));
        test.once('methodsDone', that.methodsDone.bind(that));
        test.run();
    });
};

/**
 * Callback for methodsStarted on testRunner.
 *
 * @param error
 * @param methods
 */
SolUnit.prototype.methodsStarted = function(error, methods){
    this.emit('methodsStarted', error, methods);
    // If methods failed to start we move on directly to the next contract.
    if(error){
        this.runContract();
    }
};

/**
 * Callback for methodsStarted on testRunner.
 *
 * @param {Error} error - an error.
 * @param {String} testName - The name of the test (contract).
 * @param {Object} stats - The stats.
 */
SolUnit.prototype.methodsDone = function(error, testName, stats){
    if (error) {
        this.emit('methodsDone', error, testName, stats);
    } else {
        var data = {testResults: stats};
        if (this._coverage) {
            var astFile = testName + ".ast";
            var testeeAbiFile = testName.slice(0, -4) + ".abi";
            try {
                var testAst = fs.readJsonSync(astFile);
                var testeeAbi = fs.readJsonSync(testeeAbiFile);
                data.coverageResults = coverage.analyze(testName, testAst, testeeAbi);
            } catch (error) {
                log.error("Failed to do coverage analysis. Skipping.");
                log.error(error);
            }
        }
        this._stats[testName] = data;
        this.emit('methodsDone', error, testName, data);
        this.emit('contractDone');
    }

    // Run the next contract.
    this.runContract();
};