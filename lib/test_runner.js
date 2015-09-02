/**
 * @file test_runner.js
 * @fileOverview Contains the TestRunner class.
 * @author Andreas Olofsson (andreas@erisindustries.com)
 * @module test_runner
 */
'use strict';
var events = require('events');
var nUtil = require('util');
var deepEqual = require('deep-equal');
var logger = require('./logger');
var log = logger.globalLogger();
var async = require('async');

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
            "indexed": false,
            "name": "error",
            "type": "uint256"
        },
        {
            "indexed": true,
            "name": "message",
            "type": "bytes32"
        }
    ],
    "name": "TestEvent",
    "type": "event"
};

module.exports = TestRunner;

/**
 * Runs all test methods in a given test-contract and listen for events.
 *
 * @param {String} contractName - the name of the test.
 * @param {Function} contract - a solidity contract object.
 * @constructor
 */
function TestRunner(contractName, contract) {
    this._contract = contract;
    this._completed = 0;
    this._tests = null;
    this._contractName = contractName;
    events.EventEmitter.call(this);
}

nUtil.inherits(TestRunner, events.EventEmitter);

TestRunner.prototype.run = function () {
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
                this.emit('methodsStarted', new Error("TestEvent is not an event."));
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
    if (!testEventOk || tests.length === 0) {
        if (!testEventOk) {
            this.emit('methodsStarted', new Error("Contract is missing a 'TestEvent' event"));
        } else {
            this.emit('methodsStarted', new Error("No test functions in contract."));
        }
        return;
    }

    this._tests = tests;
    this._results = [];

    this._run();
};

/**
 * Start testing.
 *
 * @private
 */
TestRunner.prototype._run = function () {
    var that = this;

    this._startSolidityEventListener(function (error) {
        var tests = that._tests;
        if (error) {
            this.emit('methodsStarted', new Error("Failed to start Solidity event listener."));
            return;
        }
        that.emit('methodsStarted', null, tests);

        // Run all the tests.
        async.eachSeries(tests, function (test, callback) {
            that.emit('methodStarted', test.name);
            var testMethod = test.name;
            // Create a new results object.
            that._results.push(newResults(testMethod));
            that._contract[testMethod](function (error) {
                var testNr = that._completed;
                var res = that._results[testNr];
                if (error) {
                    res.result = false;
                    res.error.push(error.message);
                }
                setTimeout(function () {
                    that._completed++;
                    that.emit('methodDone', res);
                    callback();
                }, 500);
            })
        }, function (error) {
            if (error) {
                that.emit('methodsDone', error);
                return;
            }
            that._stopSolidityEventListener();
            that.emit('methodsDone', null, that._contractName, that._results);
        });
    });
};

TestRunner.prototype._startSolidityEventListener = function (startError) {
    var that = this;
    this._contract.TestEvent(function (error, sub) {
        if (error) {
            startError(error.message);
            return;
        }
        that._eventSub = sub;
    }, function (error, event) {
        var res = that._results[that._completed];
        if (error) {
            res.result = false;
            res.errors.push("Solidity TestEvent returned an error: " + error.message);
            return;
        }
        var args = event.args;
        var result = args.result;
        var message = args.message;
        if (!result) {
            res.result = false;
            res.messages.push(hexToAscii(message));
        }
    });
    startError();
};

TestRunner.prototype._stopSolidityEventListener = function () {
    this._eventSub.stop();
};

function hexToAscii(hex) {
    var ascii = "";
    for (var i = 0; i < 32; i++) {
        var idx = 2 * i;
        var h = hex.slice(idx, idx + 2);
        var char = parseInt(h, 16);
        if (char === 0) {
            break;
        }
        ascii += String.fromCharCode(char);
    }
    return ascii;
}

function newResults(methodName){
    return {name: methodName, result: true, messages: [], errors: []};
}