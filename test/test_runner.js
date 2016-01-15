var assert = require('assert');
var TestRunner = require('../lib/test_runner');
var coder = require('../node_modules/web3/lib/solidity/coder');

var EVENT_SIG = 'd204e27263771793b3472e4c07118500eb1ab892c2b2f0a4b90b33c33d4df42f';

var abi = [
    {
        "constant": false,
        "inputs": [],
        "name": "testMock",
        "outputs": [],
        "type": "function"
    },
    {
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
    }
];

var abiEventFail = [
    {
        "constant": false,
        "inputs": [],
        "name": "testMock",
        "outputs": [],
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "Brüno",
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
    }
];

var abiNoTestFuncs = [
    {
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
    }
];

var megaAbi = [
    {
        "constant": false,
        "inputs": [],
        "name": "testA",
        "outputs": [],
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "testB",
        "outputs": [],
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "testC",
        "outputs": [],
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "testD",
        "outputs": [],
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "testE",
        "outputs": [],
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "testF",
        "outputs": [],
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "testG",
        "outputs": [],
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "testH",
        "outputs": [],
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "testI",
        "outputs": [],
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "testJ",
        "outputs": [],
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "testK",
        "outputs": [],
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "testL",
        "outputs": [],
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "testM",
        "outputs": [],
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "testN",
        "outputs": [],
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "testO",
        "outputs": [],
        "type": "function"
    }, {
        "inputs": [],
        "type": "constructor"
    }, {
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
    }
];

var MockProg = function(){

    var result = resultsFromEvent(eventFromData(true, ""));

    this.init = function(bin, abi, cb){
        this._abi = abi;
        cb();
    };

    this.runTx = function(opts, cb){
        if(opts.data != "0x365c9f74"){
            cb(new Error("Signature error."));
        }
        cb(null, result);
    }
};

var MockProgTwoEvent = function(){

    var result = resultsFromEvents([eventFromData(true, ""), eventFromData(true, "")]);

    this.init = function(bin, abi, cb){
        this._abi = abi;
        cb();
    };

    this.runTx = function(opts, cb){
        if(opts.data != "0x365c9f74"){
            cb(new Error("Signature error."));
        }
        cb(null, result);
    }
};

var MockProgTwoEventFirstFail = function(){

    var result = resultsFromEvents([eventFromData(false, "stack overflow"), eventFromData(true, "")]);

    this.init = function(bin, abi, cb){
        this._abi = abi;
        cb();
    };

    this.runTx = function(opts, cb){
        if(opts.data != "0x365c9f74"){
            cb(new Error("Signature error."));
        }
        cb(null, result);
    }
};

var MockProgTwoEventSecondFail = function(){

    var result = resultsFromEvents([eventFromData(true, ""), eventFromData(false, "stack overflow")]);

    this.init = function(bin, abi, cb){
        this._abi = abi;
        cb();
    };

    this.runTx = function(opts, cb){
        if(opts.data != "0x365c9f74"){
            cb(new Error("Signature error."));
        }
        cb(null, result);
    }
};

var MockProgTwoEventBothFail = function(){

    var result = resultsFromEvents([eventFromData(false, "stack overflow"), eventFromData(false, "bug overflow")]);

    this.init = function(bin, abi, cb){
        this._abi = abi;
        cb();
    };

    this.runTx = function(opts, cb){
        if(opts.data != "0x365c9f74"){
            cb(new Error("Signature error."));
        }
        cb(null, result);
    }
};


var MockProgSolidityError = function(){

    this.init = function(bin, abi, cb){
        this._abi = abi;
        cb();
    };

    this.runTx = function(opts, cb){
        cb(new Error("Mock Error"));
    }
};

var MockMegaProg = function(){

    // var result = resultsFromEvents(megaEvents);

    this.init = function(bin, abi, cb){
        this._abi = abi;
        cb();
    };

    this.runTx = function(opts, cb){

        if( opts.data == '0x71dd626b' ||
            opts.data == '0x925ea78d' ||
            opts.data == '0xeccbd4c2' ||
            opts.data == '0x83d79940' ||

            opts.data == '0xf0d061b4' ||
            opts.data == '0x54e703ef' ||
            opts.data == '0xfcf95fc3' ||
            opts.data == '0x60a1eeb2' ||
            opts.data == '0x3bb9d2e1' ||

            opts.data == '0x9fd6efa4' ||
            opts.data == '0xd9bc9e6b' ||

            opts.data == '0x785294b0'
        ){
            cb(null, resultsFromEvent(eventFromData(true, "")));
        } else if (opts.data == '0x70e83be3') {
            cb(null, resultsFromEvent(eventFromData(false, "ints not equal")));
        } else if(opts.data == '0x692dc5a1') {
            cb(null, resultsFromEvent(eventFromData(false, "stack overflow")));
        } else if(opts.data == '0xe16e4753') {
            cb(null, resultsFromEvent(eventFromData(false, "fail")));
        } else {
            cb(new Error("Signature error"));
        }


    }
};

describe('test_runner', function () {

    it("Should complete a successful test-run with one successful event", function (done) {
        var testRunner = new TestRunner("mockContract", null, abi, new MockProg());
        testRunner.on('methodsStarted', ms);
        testRunner.on('methodsDone', md);
        testRunner.run();

        function ms(error, tests) {
            assert.ifError(error);
            assert.deepEqual(tests, [{name: 'testMock', sig: '0x365c9f74'}], "Data from 'methodsStarted' is wrong.");
        }

        function md(error, testName, result) {
            assert.ifError(error);
            assert.strictEqual(testName, 'mockContract', "Data from 'methodsStarted' is wrong.");
            assert.deepEqual(result, {testMock: {
                name: 'testMock',
                result: true,
                messages: [],
                errors: []
            }}, "Data from 'methodsStarted' is wrong.");
            done();
        }
    });

    it("Should complete a successful test-run with two successful events", function (done) {
        var testRunner = new TestRunner("mockContract", null, abi, new MockProgTwoEvent());
        testRunner.on('methodsDone', md);
        testRunner.run();

        function md(error, testName, result) {
            assert.ifError(error);
            assert.strictEqual(testName, 'mockContract', "Data from 'methodsStarted' is wrong.");
            assert.deepEqual(result, {testMock: {
                name: 'testMock',
                result: true,
                messages: [],
                errors: []
            }}, "Data from 'methodsStarted' is wrong.");
            done();
        }
    });

    it("Should complete a successful test-run with two events and first fails", function (done) {
        var testRunner = new TestRunner("mockContract", null, abi, new MockProgTwoEventFirstFail());
        testRunner.on('methodsDone', md);
        testRunner.run();

        function md(error, testName, result) {
            assert.ifError(error);
            assert.strictEqual(testName, 'mockContract', "Data from 'methodsStarted' is wrong.");
            assert.deepEqual(result, {testMock: {
                name: 'testMock',
                result: false,
                messages: ["stack overflow"],
                errors: []
            }}, "Data from 'methodsStarted' is wrong.");
            done();
        }
    });

    it("Should complete a successful test-run with two test events and second fails", function (done) {
        var testRunner = new TestRunner("mockContract", null, abi, new MockProgTwoEventSecondFail());
        testRunner.on('methodsDone', md);
        testRunner.run();

        function md(error, testName, result) {
            assert.ifError(error);
            assert.strictEqual(testName, 'mockContract', "Data from 'methodsStarted' is wrong.");
            assert.deepEqual(result, {testMock: {
                name: 'testMock',
                result: false,
                messages: ["stack overflow"],
                errors: []
            }}, "Data from 'methodsStarted' is wrong.");
            done();
        }
    });

    it("Should complete a successful test-run with two test events and both fails", function (done) {
        var testRunner = new TestRunner("mockContract", null, abi, new MockProgTwoEventBothFail());
        testRunner.on('methodsDone', md);
        testRunner.run();

        function md(error, testName, result) {
            assert.ifError(error);
            assert.strictEqual(testName, 'mockContract', "Data from 'methodsStarted' is wrong.");
            assert.deepEqual(result, {testMock: {
                name: 'testMock',
                result: false,
                messages: ["stack overflow", "bug overflow"],
                errors: []
            }}, "Data from 'methodsStarted' is wrong.");
            done();
        }
    });

    it("Should fail at finding a proper test-event", function (done) {
        var testRunner = new TestRunner("mockContract", null, abiEventFail, null);
        testRunner.on('methodsStarted', ms);
        testRunner.run();

        function ms(error) {
            assert(error, "Did not get an error from 'methodsStarted' listener");
            assert.equal(error.message, "TestEvent is not an event.", "Wrong error message");
            done();
        }
    });


    it("Should fail at finding any test functions", function (done) {
        var testRunner = new TestRunner("mockContract", null, abiNoTestFuncs, null);
        testRunner.on('methodsStarted', ms);
        testRunner.run();

        function ms(error) {
            assert(error, "Did not get an error from 'methodsStarted' listener");
            assert.equal(error.message, "No test functions in contract.");
            done();
        }
    });

    it("Should fail due to a solidity/VM error", function (done) {
        var testRunner = new TestRunner("mockContractSolidityError", null, abi, new MockProgSolidityError());
        testRunner.on('methodsDone', md);
        testRunner.run();

        function md(error, testName, result) {
            assert.equal(result.testMock.errors[0], "VM error: Mock Error");
            done();
        }

    });

    it("Should complete a test with 15 different test functions", function (done) {
        this.timeout(10000);

        var expectedTests = [
            {name: 'testA', sig: '0x71dd626b'},
            {name: 'testB', sig: '0x925ea78d'},
            {name: 'testC', sig: '0xeccbd4c2'},
            {name: 'testD', sig: '0x83d79940'},
            {name: 'testE', sig: '0x70e83be3'},
            {name: 'testF', sig: '0xf0d061b4'},
            {name: 'testG', sig: '0x54e703ef'},
            {name: 'testH', sig: '0xfcf95fc3'},
            {name: 'testI', sig: '0x60a1eeb2'},
            {name: 'testJ', sig: '0x3bb9d2e1'},
            {name: 'testK', sig: '0x692dc5a1'},
            {name: 'testL', sig: '0x9fd6efa4'},
            {name: 'testM', sig: '0xd9bc9e6b'},
            {name: 'testN', sig: '0xe16e4753'},
            {name: 'testO', sig: '0x785294b0'}];

        var expectedResult = {
            testA: {name: 'testA', result: true, messages: [], errors: []},
            testB: {name: 'testB', result: true, messages: [], errors: []},
            testC: {name: 'testC', result: true, messages: [], errors: []},
            testD: {name: 'testD', result: true, messages: [], errors: []},
            testE: {name: 'testE', result: false, messages: ['ints not equal'], errors: []},
            testF: {name: 'testF', result: true, messages: [], errors: []},
            testG: {name: 'testG', result: true, messages: [], errors: []},
            testH: {name: 'testH', result: true, messages: [], errors: []},
            testI: {name: 'testI', result: true, messages: [], errors: []},
            testJ: {name: 'testJ', result: true, messages: [], errors: []},
            testK: {name: 'testK', result: false, messages: ['stack overflow'], errors: []},
            testL: {name: 'testL', result: true, messages: [], errors: []},
            testM: {name: 'testM', result: true, messages: [], errors: []},
            testN: {name: 'testN', result: false, messages: ['fail'], errors: []},
            testO: {name: 'testO', result: true, messages: [], errors: []}
        };

        var testRunner = new TestRunner("mockMegaContract", null, megaAbi, new MockMegaProg());
        testRunner.on('methodsStarted', ms);
        testRunner.on('methodsDone', md);
        testRunner.run();

        function ms(error, tests) {
            assert.ifError(error);
            assert.deepEqual(tests, expectedTests, "Test list does not match.");
        }

        function md(error, testName, result) {
            assert.ifError(error);
            assert.strictEqual(testName, 'mockMegaContract', "Data from methods done is wrong.");
            for (var o in expectedResult) {
                if (expectedResult.hasOwnProperty(o)) {
                    assert.deepEqual(expectedResult[o], result[o], "Results does not match.");
                }
            }
            done();
        }

    });

});

function eventFromData(result, message){
    return [null,
        [new Buffer(EVENT_SIG, 'hex'), new Buffer(formatBoolIp(result), 'hex')],
        new Buffer(formatStringIp(message), 'hex')
    ];
}

function resultsFromEvents(events){
    return {vm: {logs: events}};
}

function resultsFromEvent(event){
    return resultsFromEvents([event]);
}

function formatStringIp(rawHex){
    return coder.encodeParam("string", rawHex);
}

function formatBoolIp(rawHex){
    return coder.encodeParam("bool", rawHex);
}

