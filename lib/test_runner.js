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
        if(!testEventOk) {
            this.emit('methodsStarted', new Error("Contract is missing a 'TestEvent' event"));
        } else {
            this.emit('methodsStarted', new Error("No test functions in contract."));
        }
        return;
    }

    this._tests = tests;
    this._results = new Array(tests.length);

    this._startSolidityEventListener();

    for(i = 0; i < tests.length; i++){
        var testMethod = tests[i].name;
        // TODO check for exceptions later.
        this._contract[testMethod](function () {});
    }
    this.emit('methodsStarted', null, tests);
};

TestRunner.prototype._startSolidityEventListener = function(){

    this._contract.TestEvent(function (error, event) {
        var testNum = -1;
        var errorMsg = "";
        var testName = "";
        var result = false;
        var message = "";

        if (error) {
            errorMsg = "Solidity TestEvent returned an error: " + error.message;
        } else {
            var args = event.args;
            var sig = args.fId.slice(-8);
            result = args.result;
            message = args.message;
            // TODO This is not used atm.
            //var err = args.error.toString();
            //if (err !== "0"){
            //
            //}
            for(var i = 0; i < this._tests.length; i++){
                var test = this._tests[i];
                if(test.sig === sig){
                    testNum = i;
                    testName = test.name;
                    break;
                }
            }
            if(testNum === -1){
                errorMsg = "Error: did not recognize test function signature: " + sig;
            }
        }
        // TODO how to treat this weird error? Right now just abort. Tests are corrupt anyways.
        if(testNum === -1){
            log.error(errorMsg);
            this.emit('methodsDone', new Error(errorMsg), this._contractName);
            return;
        }

        this._results[testNum] = {name: testName, result: result, message: message, error: errorMsg};
        this._completed++;
        if (this._completed === this._tests.length) {
            this._stopSolidityEventListener();
            this.emit('methodsDone', null, this._contractName, this._results);
        }
    }.bind(this));
};

TestRunner.prototype._stopSolidityEventListener = function(){
    //TODO implement.
};