/**
 * @file coverage.js
 * @fileOverview This module reads test-contract ASTs to calculate test coverage.
 * @author Andreas Olofsson (andreas@erisindustries.com)
 * @module coverage
 */
'use strict';

var nUtil = require('util');
var parsing = require('./tree_parsing');
var logger = require('./logger');
var log = logger.globalLogger();
var testeeName = "testee";

var RECORD = true;

var VisitorBase;

if (RECORD) {
    VisitorBase = parsing.RecordVisitor;
} else {
    VisitorBase = parsing.Visitor;
}

/**
 * Analyze the coverage of a unit test contract.
 *
 * @param testName The name of the test contract.
 * @param testAST The json AST root object of the contract.
 * @param targetABI The json interface (ABI) of the testee.
 *
 */
exports.analyze = function (testName, testAST, targetABI) {
    var testRoot = findContract(testName, testAST);
    if (testRoot === null) {
        log.error("No test-contract of the given name was found in the AST: " + this._testName);
        return null;
    }
    log.debug("Found testroot.");
    var testee = findTestee(testRoot);
    if (!testee) {
        log.error("Can't find a " + testeeName + " field in: " + testName);
        return null;
    }
    log.debug("Found testee.");

    log.info("Starting to search for tests.");

    var testVisitor = new TestVisitor(testName);
    testVisitor.visit(testRoot);
    var tested = testVisitor.getTested();

    return getCoverageResults(unique(tested), targetABI);
};

function TestVisitor() {

    // Keep track of which test function we're currently in.
    // No need tracking contracts as it only ever works on one contract.
    this._scope = "";
    this._tested = [];
    var process = function (node) {
        // If it encounters a test function, switch state.
        if (node.name === "Function") {
            if (node.attributes.name.indexOf('test') === 0) {
                this._scope = node.attributes.name;
            } else {
                this._scope = "";
            }
        }

        // If it encounters a function call (within a test function), check if it's called on
        // 'testee'.
        if (node.name === "FunctionCall") {
            // If no current test function is set, just ignore.
            if (this._scope == "") {
                return;
            }
            var children = node.children;

            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child.name === 'MemberAccess') {
                    var fName = child.attributes.member_name;
                    var children2 = child.children;
                    // Not sure if these need to be checked or if it's always child 0. Could be some
                    // cases so will just keep it for now. This is not performance sensitive, and if it
                    // were I'd have way bigger issues then this...
                    for (var j = 0; j < children2.length; j++) {
                        var child2 = children2[j];
                        if (child2.name === 'Identifier' && child2.attributes.value === "testee") {
                            // Register.
                            this._tested.push(fName);
                            log.debug(this._scope + " registering " + fName);
                        }
                    }
                }
            }
        }

        // If it encounters a new contract, stop.
        // TODO look into this.
        return node.name === "Contract";
    };
    VisitorBase.call(this, process.bind(this));
}

nUtil.inherits(TestVisitor, VisitorBase);

TestVisitor.prototype.getTested = function(){
    return this._tested;
};

// Gets the results of the analysis.
function getCoverageResults(tested, targetAbi) {
    var coverage = [];
    //
    for (var i = 0; i < targetAbi.length; i++) {
        var fAbi = targetAbi[i];
        if (fAbi.type === "function") {
            var fName = fAbi.name;
            var c = tested.indexOf(fName) !== -1;
            coverage.push({func: fName, covered: c});
        }
    }
    return coverage;
}

// Find a testee variable starting at the given node.
function findTestee(rootNode) {
    var process = function (node) {
        return node.name === "VariableDeclaration" && node.attributes.name === testeeName;
    };
    var visitor = new parsing.Visitor(process);
    return visitor.visit(rootNode);
}

// Find a contract with a given name starting at the given node.
function findContract(contractName, rootNode) {
    var process = function (node) {
        return node.name === "Contract" && node.attributes.name === contractName;
    };
    var visitor = new parsing.Visitor(process);
    return visitor.visit(rootNode);
}

function unique(arr) {
    var seen = {};
    return arr.filter(function(e) {
        if (seen[e])
            return;
        seen[e] = true;
        return e;
    })
}