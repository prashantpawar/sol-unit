/**
 * @file coverage.js
 * @fileOverview This module reads test-contract ASTs to calculate test coverage.
 * @author Andreas Olofsson (andreas@erisindustries.com)
 * @module coverage
 */
'use strict';

var nUtil = require('util');
var logger = require('./logger');
var log = logger.globalLogger();
var parsing = require('./tree_parsing');

/**
 * Analyze the coverage of a unit test contract.
 *
 * @param {string} testName - The name of the test contract.
 * @param {Object} testAST - The json AST root object of the contract.
 * @param {string} targetName - The name of the target contract.
 * @param {Object} targetABI - The json ABI for the contract.
 */
function analyze(testName, testAST, targetName, targetABI) {

    var allTested = [];

    var contractTargets = getFunctionsFromContract(targetName, targetABI);

    // TODO use full signature to account for overloaded functions.
    var targets = contractTargets;

    while (Object.keys(targets).length) {
        var testFinder = findTests(testName, testAST, targets);
        var candidates = testFinder.getCandidates();
        var tested = testFinder.getTested();

        allTested = allTested.concat(tested);

        targets = candidates;
    }
    return getCoverageResults(unique(allTested), contractTargets);
}

function findTests(testName, testAST, targetMethods){
    var testFinder = new TestFinder(testName, targetMethods);
    testFinder.visit(testAST);
    return testFinder;
}

// Used to find candidates
function TestFinder(testName, targetMethods) {
    this._testName = testName;
    this._targetMethods = targetMethods;
    // Keep track of which test function we're currently in.
    // No need tracking contracts as it only ever works on one contract.
    this._fScope = "";
    this._cScope = "";
    this._candidates = {};
    this._tested = [];
    parsing.Visitor.call(this, this._process);
}

nUtil.inherits(TestFinder, parsing.Visitor);

TestFinder.prototype._process = function (node) {
    // If it encounters a contract.
    if (node.name === "Contract") {
        this._cScope = node.attributes.name;
        this._fScope = "";
        log.debug("** Contract scope changed: " + this._cScope);
    }

    // If it encounters a function.
    if (node.name === "Function" && this._cScope) {
        this._fScope = node.attributes.name;
        log.debug("Function scope changed: " + this._fScope);
    }

    // If it encounters a function call, find out if it's a target.
    if (node.name === "FunctionCall") {
        log.debug("FunctionCall");
        // If no current contract.
        if (this._cScope == "") {
            return;
        }

        var children = node.children;

        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            // If member access.
            if (child.name === 'MemberAccess') {

                // We must check these later so that the function being called isn't a function in
                // some other contract that happens to have the same name.
                var mName = child.attributes.member_name;
                log.debug("Member access: " + mName);

                var children2 = child.children;

                // Not sure if these need to be checked or if it's always child 0. Could be some
                // cases so will just keep it for now.
                for (var j = 0; j < children2.length; j++) {
                    var child2 = children2[j];
                    if (child2.name === 'Identifier') {
                        var varType = child2.attributes.type;
                        if(varType.indexOf("contract") !== 0){
                            log.debug("Variable not a contract.");
                            return;
                        }

                        var cName = varType.slice(9);
                        var full = cName + "." + mName;
                        var tMtd = this._targetMethods[full];
                        if(!tMtd){
                            log.debug("Not a target method:" + full);
                            return;
                        }

                        var confirmed = false;
                        // To check if this is done from a test method in the test contract.
                        if(this._cScope === this._testName && this._fScope.indexOf("test") === 0){
                            confirmed = true;
                            this._tested.push(tMtd.baseFunc);
                        } else {
                            var callData = getFunctionData(this._cScope, this._fScope, tMtd.baseContract, tMtd.baseFunc);
                            // Register.
                            var fullName = this._cScope + "." + this._fScope;
                            this._candidates[fullName] = callData;
                        }
                        log.debug(this._cScope + "." + this._fScope + ": registering " + cName + "." + mName + (confirmed ? " (tested)" : " (candidate)"));
                        return;
                    }
                }
            } else if (child.attributes.type.indexOf("function") === 0){
                var fName = child.attributes.value;
                var full = this._cScope + "." + fName;
                var tMtd = this._targetMethods[full];
                log.debug("Function called: " + full);
                if(!tMtd){
                    log.debug("Not a target method name");
                    return;
                } else {
                    // To check if this is done from a test method in the test contract.
                    if(this._cScope === this._testName && this._fScope.indexOf("test") === 0){
                        confirmed = true;
                        this._tested.push(tMtd.baseFunc);
                    } else {
                        var callData = getFunctionData(this._cScope, this._fScope, tMtd.baseContract, tMtd.baseFunc);
                        // Register.
                        var fullName = this._cScope + "." + this._fScope;
                        this._candidates[fullName] = callData;
                    }
                    log.debug(this._cScope + "." + this._fScope + ": registering " + cName + "." + mName + (confirmed ? " (tested)" : " (candidate)"));
                    return;
                }
            }
        }
    }
};

TestFinder.prototype.getCandidates = function(){
    return this._candidates;
};

TestFinder.prototype.getTested = function(){
    return unique(this._tested);
};

function getFunctionsFromContract(contractName, jsonABI){
    var functions = {};
    for (var i = 0; i < jsonABI.length; i++) {
        var fAbi = jsonABI[i];

        if (fAbi.type === "function") {
            var fName = fAbi.name;
            var full = contractName + "." + fName;
            functions[full] = getFunctionData(contractName, fName, contractName, fName);
        }
    }
    return functions;
}

function getFunctionData(contract, func, baseContract, baseFunc){
    return {
        contract: contract,
        func: func,
        baseContract: baseContract,
        baseFunc: baseFunc
    };
}

// Gets the results of the analysis.
function getCoverageResults(tested, targets) {
    var coverage = [];
    for (var key in targets) {
        // Shut linter up...
        if(targets.hasOwnProperty(key)){
            var fName = targets[key].baseFunc;
            var index = tested.indexOf(fName);
            var c = (index !== -1);
            coverage.push({func: fName, covered: c});
        }
    }
    return coverage;
}

function transformToFullName(json) {
    if (json.name.indexOf('(') !== -1) {
        return json.name;
    }

    var typeName = json.inputs.map(function (i) {
        return i.type;
    }).join();
    return json.name + '(' + typeName + ')';
}

function unique(arr) {
    var seen = {};
    return arr.filter(function (e) {
        if (seen[e])
            return;
        seen[e] = true;
        return e;
    })
}

exports.analyze = analyze;