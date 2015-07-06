/**
 * @file test_runner.js
 * @fileOverview Contains the TestRunner class.
 * @author Andreas Olofsson (andreas@erisindustries.com)
 * @module test_runner
 */
'use strict';

var deepEqual = require('deep-equal');
var logger = require('./logger');
var log = logger.globalLogger();
var testLog = logger.testLogger();

var eventJson = {
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "name": "fId",
            "type": "address"
        },
        {
            "indexed": true,
            "name": "result",
            "type": "bool"
        },
        {
            "indexed": true,
            "name": "error",
            "type": "uint256"
        },
        {
            "indexed": false,
            "name": "message",
            "type": "bytes32"
        }
    ],
    "name": "TestEvent",
    "type": "event"
};

module.exports = TestRunner;

function TestRunner(contract) {
    this._contract = contract;
    this._completed = 0;
    this._callback = null;
    this._tests = null;
}

TestRunner.prototype.run = function (callback) {
    this._callback = callback;
    var tests = [];
    var testEventOk = false;
    var abi = this._contract.abi;

    // Make sure the contract has the proper functions and events.
    for (var i = 0; i < abi.length; i++) {
        var elem = abi[i];
        if (!elem.name) {
            continue;
        }
        if (elem.name === 'TestEvent') {
            if (!deepEqual(elem, eventJson)) {
                callback(new Error("TestEvent is not an event."));
                return;
            } else {
                testEventOk = true;
            }
        }
        if (elem.name.indexOf("test") === 0) {
            var sig = this._contract[elem.name].signature();
            tests.push({name: elem.name, sig: sig});
        }
    }
    if (!testEventOk) {
        callback(new Error("Contract is missing a 'TestEvent' event"));
        return;
    }
    if (tests.length === 0) {
        callback(new Error("No test functions in contract."));
        return;
    }
    this._tests = tests;
    this._results = new Array(tests.length);

    // Start
    testLog.info("Deployed succesfully.")
    console.log('');
    this._startListening();
    for(i = 0; i < tests.length; i++){
        var testMethod = tests[i].name;
        testLog.info("Running '" + testMethod + "' (" +  (i + 1).toString() + " of " + tests.length + ")");
        // TODO check for exceptions later.
        this._contract[testMethod](function () {});
    }
    console.log('');
    testLog.info("Waiting for transactions to be committed...");
};

TestRunner.prototype._startListening = function(){
    var that = this;
    this._contract.TestEvent(function (error, event) {
        if (error) {
            that._callback(error);
            return;
        }
        var args = event.args;
        var sig = args.fId.slice(-8);
        var testResult = args.result;
        var err = args.error.toString();
        if (err !== "0"){
            // TODO This is not used atm.
        }
        var testNum = -1;
        for(var i = 0; i < that._tests.length; i++){
            var test = that._tests[i];
            if(test.sig === sig){
                testNum = i;
                break;
            }
        }
        if(testNum === -1){
            that._callback(new Error("Error: did not recognize test function signature: " + sig));
            return;
        }
        that._results[testNum] = {result: testResult, message: args.message};
        that._completed++;
        if (that._completed === that._tests.length) {
            // TODO shut down sub.
            that._finalize();
        }
    });
};

TestRunner.prototype._stopListening = function(){
    //TODO implement.
};

TestRunner.prototype._finalize = function () {
    var r = true;
    console.log("");
    var results = {successful: 0, total: this._results.length};
    for (var i = 0; i < this._results.length; i++) {
        var testResult = this._results[i].result;
        var ti = "'" + this._tests[i].name + "' - " ;
        if (testResult) {
            results.successful++;
            testLog.success(ti + "PASSED");
        } else {
            testLog.fail(ti + "FAILED: " + this._results[i].message || "(no message)");
        }
        r = r && testResult;
    }
    if (r) {
        testLog.success("*** All tests PASSED ***\n")
    } else {
        testLog.fail("!!! Some tests FAILED !!!\n")
    }
    // var cvg = coverage.analyze(ast, tAbi);
    // presentCoverage(cvg);
    this._stopListening();

    this._callback(null, results);
};
