/**
 * @file test_runner.js
 * @fileOverview Contains the TestRunner class.
 * @author Andreas Olofsson (androlo1980@gmail.com)
 * @module test_runner
 */
'use strict';
var events = require('events');
var nUtil = require('util');
var deepEqual = require('deep-equal');
var logger = require('./logger');
var async = require('async');
var sha3 = require('../node_modules/web3/lib/utils/sha3');
var coder = require('../node_modules/web3/lib/solidity/coder');

var EVENT_SIG = new Buffer('d204e27263771793b3472e4c07118500eb1ab892c2b2f0a4b90b33c33d4df42f', 'hex');

var eventJson = {
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "name": "result",
            "type": "bool"
        },
        {
            "indexed": false,
            "name": "message",
            "type": "string"
        }
    ],
    "name": "TestEvent",
    "type": "event"
};

module.exports = TestRunner;

/**
 * Runs all test methods in a given test-contract and listen for events.
 *
 * @param {String} testContractName - the name of the test-contract.
 * @param {String} bin - the bytecode.
 * @param {Array} abi - the json ABI.
 * @param {Object} program - the program.
 * @constructor
 */
function TestRunner(testContractName, bin, abi, program) {
    this._completed = 0;
    this._tests = null;
    this._contractName = testContractName;
    this._bin = bin;
    this._abi = abi;
    this._prog = program;
    events.EventEmitter.call(this);
}

nUtil.inherits(TestRunner, events.EventEmitter);

TestRunner.prototype.run = function () {
    var tests = [];
    var testEventOk = false;
    var abi = this._abi;
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
            var fullName = toFullname(elem);
            tests.push({name: elem.name, sig: '0x' + signature(fullName)});
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

    var that = this;

    var prog = this._prog;
    prog.init(this._bin, this._abi, function(error){
        if(error){
            return that.emit('methodsStarted', new Error("Contract failed to deploy: " + error));
        }

        that.emit('methodsStarted', null, tests);

        // Run all the tests.
        async.eachSeries(tests, function (test, callback) {
            that.emit('methodStarted', test.name);
            var testMethod = test.name;
            // Create a new results object.
            //that._results.push(newResults(testMethod));
            that._results[testMethod] = newResults(testMethod);

            prog.runTx({data: test.sig, to: prog.createdAddress}, function(error, execResult){

                var res = that._results[testMethod];

                if (error) {
                    res.result = false;
                    res.errors.push("VM error: " + error.message);
                    that.emit('methodDone', res);
                    return callback();
                }
                var events = execResult.vm.logs;
                for(var i = 0; i < events.length; i++){
                    var event = events[i];
                    if(Buffer.compare(event[1][0],EVENT_SIG) != 0){
                        continue;
                    }
                    var result = formatBool(event[1][1].toString('hex'));
                    var message = formatString(event[2].toString('hex'));
                    res.result = res.result && result;
                    if(!result) {
                        res.messages.push(message);
                    }
                }
                that.emit('methodDone', res);
                callback();
            })
        }, function (error) {
            if (error) {
                that.emit('methodsDone', error);
                return;
            }
            that.emit('methodsDone', null, that._contractName, that._results);
        });

    });

};

function newResults(methodName){
    return {name: methodName, result: true, messages: [], errors: []};
}

var toFullname = function (json) {
    if (json.name.indexOf('(') !== -1) {
        return json.name;
    }

    var typeName = json.inputs.map(function(i){return i.type; }).join();
    return json.name + '(' + typeName + ')';
};

function signature(name) {
    return sha3(name).slice(0, 8);
}

function formatString(rawHex){
    return coder.decodeParam("string", rawHex);
}

function formatBool(rawHex){
    return coder.decodeParam("bool", rawHex);
}