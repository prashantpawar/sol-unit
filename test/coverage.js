var assert = require('assert');
var coverage = require('../lib/coverage');

var logger = require('../lib/logger');
// logger.setConsoleLevel("debug");

var arrayTestAST = require('./testdata/ArrayTest.ast.json');
var arrayABI = require('./testdata/Array.abi.json');

var bankTestAST = require('./testdata/BankTest.ast.json');
var bankABI = require('./testdata/Bank.abi.json');

var basicTypesTestAST = require('./testdata/BasicTypesTest.ast.json');
var basicTypesABI = require('./testdata/BasicTypes.abi.json');

var structsTestAST = require('./testdata/StructsTest.ast.json');
var structsABI = require('./testdata/Structs.abi.json');

var wrapsInternalTestAST = require('./testdata/WrapsInternalTest.ast.json');
var wrapsInternalABI = require('./testdata/WrapsInternal.abi.json');

describe('analyze', function () {

    it("Should find the tests in ArrayTest'", function () {
        var coverageData = coverage.analyze("ArrayTest", arrayTestAST, "Array", arrayABI);

        var expected = [ { func: 'push', covered: true },
            { func: 'array', covered: true },
            { func: 'dynArray', covered: true },
            { func: 'setElement', covered: true },
            { func: 'dynArrayLen', covered: true },
            { func: 'pop', covered: true },
            { func: 'resetDynArray', covered: true } ];

        assert.deepEqual(coverageData, expected, "Coverage data does not match.")
    });

    it("Should find the tests in BankTest'", function () {
        var coverageData = coverage.analyze("BankTest", bankTestAST, "Bank", bankABI);

        var expected = [ { func: 'names', covered: false },
                { func: 'getMyName', covered: false },
                { func: 'transfer', covered: true },
                { func: 'owner', covered: true },
                { func: 'getBalance', covered: true },
                { func: 'getMyAddress', covered: true },
                { func: 'remove', covered: false },
                { func: 'registerNewAccount', covered: true },
                { func: 'deleteAccount', covered: true },
                { func: 'endow', covered: true } ];

        assert.deepEqual(coverageData, expected, "Coverage data does not match.")
    });

    it("Should find the tests in BasicTypesTest'", function () {
        var coverageData = coverage.analyze("BasicTypesTest", basicTypesTestAST, "BasicTypes", basicTypesABI);

        var expected = [ { func: 'setUintF', covered: true },
            { func: 'setIntF', covered: true },
            { func: 'ownerF', covered: true },
            { func: 'setBytes32F', covered: true },
            { func: 'uintF', covered: true },
            { func: 'boolF', covered: true },
            { func: 'bytes32F', covered: true },
            { func: 'intF', covered: true },
            { func: 'setBoolF', covered: true } ];

        assert.deepEqual(coverageData, expected, "Coverage data does not match.")
    });

    it("Should find the tests in StructsTest'", function () {
        var coverageData = coverage.analyze("StructsTest", structsTestAST, "Structs", structsABI);

        var expected = [ { func: 'getStructA', covered: true },
            { func: 'setStructB', covered: true },
            { func: 'setStructY', covered: true },
            { func: 'getStructX', covered: true },
            { func: 'setStructX', covered: true },
            { func: 'getStructB', covered: true },
            { func: 'getStructY', covered: true },
            { func: 'setStructA', covered: true } ];

        assert.deepEqual(coverageData, expected, "Coverage data does not match.")
    });

    it("Should find the tests in WrapsInternalTest'", function () {
        var coverageData = coverage.analyze("WrapsInternalTest", wrapsInternalTestAST, "WrapsInternal", wrapsInternalABI);

        var expected = [ { func: 'mult', covered: true } ];

        assert.deepEqual(coverageData, expected, "Coverage data does not match.")
    });

});