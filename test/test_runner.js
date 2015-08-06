var assert = require('assert');
var TestRunner = require('../lib/test_runner');
var erisC = require('eris-contracts');

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
                "name": "fId",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "Brüno",
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
    }
];

var abiNoTestFuncs = [
    {
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
    }
];

var mockMegaEvents = [
    {
        args: {
            fId: "00000001",
            result: true,
            error: 0,
            message: ""
        }
    }, {
        args: {
            fId: "00000002",
            result: true,
            error: 0,
            message: ""
        }
    }, {
        args: {
            fId: "00000003",
            result: true,
            error: 0,
            message: ""
        }
    }, {
        args: {
            fId: "00000004",
            result: true,
            error: 0,
            message: ""
        }
    }, {
        args: {
            fId: "00000005",
            result: false,
            error: 0,
            message: erisC.utils.padRight(erisC.utils.asciiToHex("ints not equal"), 32)
        }
    }, {
        args: {
            fId: "00000006",
            result: true,
            error: 0,
            message: ""
        }
    }, {
        args: {
            fId: "00000007",
            result: true,
            error: 0,
            message: ""
        }
    }, {
        args: {
            fId: "00000008",
            result: true,
            error: 0,
            message: ""
        }
    }, {
        args: {
            fId: "00000009",
            result: true,
            error: 0,
            message: ""
        }
    }, {
        args: {
            fId: "0000000a",
            result: true,
            error: 0,
            message: ""
        }
    }, {
        args: {
            fId: "0000000b",
            result: false,
            error: 0,
            message: erisC.utils.padRight(erisC.utils.asciiToHex("stack overflow"), 32)
        }
    }, {
        args: {
            fId: "0000000c",
            result: true,
            error: 0,
            message: ""
        }
    }, {
        args: {
            fId: "0000000d",
            result: true,
            error: 0,
            message: ""
        }
    }, {
        args: {
            fId: "0000000e",
            result: false,
            error: 0,
            message: erisC.utils.padRight(erisC.utils.asciiToHex("fail"), 32)
        }
    }, {
        args: {
            fId: "0000000f",
            result: true,
            error: 0,
            message: ""
        }
    }
];


var mockEvent = {
    args: {
        fId: "11111111",
        result: true,
        error: 0,
        message: ""
    }
};

var MockSub = function () {
    this.stop = function () {
    };
    this.poll = function () {
    };
};

var MockContract = function () {

    this.TestEvent = function (startCallback, callback) {
        startCallback(null, new MockSub);
        this._callback = callback;
    };

    this.testMock = function (cb) {
        this._callback(null, mockEvent);
        cb();
    };

    this.testMock.signature = function () {
        return "11111111";
    };

    this.abi = abi;
};

var MockContractEventParseError = function () {

    this.testMock = function (cb) {
        cb();
    };

    this.testMock.signature = function () {
        return "11111111";
    };

    this.abi = abiEventFail;
};

var MockContractNoTestFuncsError = function () {

    this.testMock = function (cb) {
        cb();
    };

    this.testMock.signature = function () {
        return "11111111";
    };

    this.abi = abiNoTestFuncs;
};

var MockContractSolidityError = function () {

    this.TestEvent = function (startCallback, callback) {
        startCallback(null, new MockSub);
        this._callback = callback;
    };

    this.testMock = function (cb) {
        this._callback(new Error('Mock error'));
        cb();
    };

    this.testMock.signature = function () {
        return "11111111";
    };
    this.abi = abi;
};

var MockMegaContract = function () {

    this.TestEvent = function (startCallback, callback) {
        startCallback(null, new MockSub);
        this._callback = callback;
    };

    this.testA = function (cb) {
        this._callback(null, mockMegaEvents[0]);
        cb();
    };

    this.testB = function (cb) {
        this._callback(null, mockMegaEvents[1]);
        cb();
    };

    this.testC = function (cb) {
        this._callback(null, mockMegaEvents[2]);
        cb();
    };

    this.testD = function (cb) {
        this._callback(null, mockMegaEvents[3]);
        cb();
    };

    this.testE = function (cb) {
        this._callback(null, mockMegaEvents[4]);
        cb();
    };

    this.testF = function (cb) {
        this._callback(null, mockMegaEvents[5]);
        cb();
    };

    this.testG = function (cb) {
        this._callback(null, mockMegaEvents[6]);
        cb();
    };

    this.testH = function (cb) {
        this._callback(null, mockMegaEvents[7]);
        cb();
    };

    this.testI = function (cb) {
        this._callback(null, mockMegaEvents[8]);
        cb();
    };

    this.testJ = function (cb) {
        this._callback(null, mockMegaEvents[9]);
        cb();
    };

    this.testK = function (cb) {
        this._callback(null, mockMegaEvents[10]);
        cb();
    };

    this.testL = function (cb) {
        this._callback(null, mockMegaEvents[11]);
        cb();
    };

    this.testM = function (cb) {
        this._callback(null, mockMegaEvents[12]);
        cb();
    };

    this.testN = function (cb) {
        this._callback(null, mockMegaEvents[13]);
        cb();
    };

    this.testO = function (cb) {
        this._callback(null, mockMegaEvents[14]);
        cb();
    };

    this.testA.signature = function () {
        return "00000001";
    };

    this.testB.signature = function () {
        return "00000002";
    };

    this.testC.signature = function () {
        return "00000003";
    };

    this.testD.signature = function () {
        return "00000004";
    };

    this.testE.signature = function () {
        return "00000005";
    };

    this.testF.signature = function () {
        return "00000006";
    };

    this.testG.signature = function () {
        return "00000007";
    };

    this.testH.signature = function () {
        return "00000008";
    };

    this.testI.signature = function () {
        return "00000009";
    };

    this.testJ.signature = function () {
        return "0000000a";
    };

    this.testK.signature = function () {
        return "0000000b";
    };

    this.testL.signature = function () {
        return "0000000c";
    };

    this.testM.signature = function () {
        return "0000000d";
    };

    this.testN.signature = function () {
        return "0000000e";
    };

    this.testO.signature = function () {
        return "0000000f";
    };

    this.abi = megaAbi;
};

describe('test_runner', function () {

    it("Should complete a successful test-run", function (done) {
        var mockContract = new MockContract();
        var testRunner = new TestRunner("mockContract", mockContract);
        testRunner.on('methodsStarted', ms);
        testRunner.on('methodsDone', md);
        testRunner.run();

        function ms(error, tests) {
            assert.ifError(error);
            assert.deepEqual(tests, [{name: 'testMock', sig: '11111111'}], "Data from 'methodsStarted' is wrong.");
        }

        function md(error, testName, result) {
            assert.ifError(error);
            assert.strictEqual(testName, 'mockContract', "Data from 'methodsStarted' is wrong.");
            assert.deepEqual(result, [{
                name: 'testMock',
                result: true,
                messages: [],
                errors: []
            }], "Data from 'methodsStarted' is wrong.");
            done();
        }
    });

    it("Should fail at finding a proper test-event.", function (done) {
        var mockContract = new MockContractEventParseError();
        var testRunner = new TestRunner("testEventFail", mockContract);
        testRunner.on('methodsStarted', ms);
        testRunner.run();

        function ms(error) {
            assert(error, "Did not get an error from 'methodsStarted' listener");
            assert.equal(error.message, "TestEvent is not an event.", "Wrong error message");
            done();
        }
    });

    it("Should fail at finding any test functions.", function (done) {
        var mockContract = new MockContractNoTestFuncsError();
        var testRunner = new TestRunner("testNoTestFuncs", mockContract);
        testRunner.on('methodsStarted', ms);
        testRunner.run();

        function ms(error) {
            assert(error, "Did not get an error from 'methodsStarted' listener");
            assert.equal(error.message, "No test functions in contract.");
            done();
        }
    });

    it("Should fail due to a solidity error", function (done) {
        var mockContract = new MockContractSolidityError();
        var testRunner = new TestRunner("mockContractSolidityError", mockContract);
        testRunner.on('methodsStarted', ms);
        testRunner.on('methodsDone', md);
        testRunner.run();

        function ms(error, tests) {
            assert.ifError(error);
            assert.deepEqual(tests, [{name: 'testMock', sig: '11111111'}], "Data from 'methodsStarted' is wrong.");
        }

        function md(error, testName, result) {
            assert.equal(result[0].errors[0], "Solidity TestEvent returned an error: Mock error");
            done();
        }
    });

    it("Should complete a successful larger test", function (done) {
        this.timeout(10000);

        var expectedTests = [
            {name: 'testA', sig: '00000001'},
            {name: 'testB', sig: '00000002'},
            {name: 'testC', sig: '00000003'},
            {name: 'testD', sig: '00000004'},
            {name: 'testE', sig: '00000005'},
            {name: 'testF', sig: '00000006'},
            {name: 'testG', sig: '00000007'},
            {name: 'testH', sig: '00000008'},
            {name: 'testI', sig: '00000009'},
            {name: 'testJ', sig: '0000000a'},
            {name: 'testK', sig: '0000000b'},
            {name: 'testL', sig: '0000000c'},
            {name: 'testM', sig: '0000000d'},
            {name: 'testN', sig: '0000000e'},
            {name: 'testO', sig: '0000000f'}];

        var expectedResult = [
            {name: 'testA', result: true, messages: [], errors: []},
            {name: 'testB', result: true, messages: [], errors: []},
            {name: 'testC', result: true, messages: [], errors: []},
            {name: 'testD', result: true, messages: [], errors: []},
            {
                name: 'testE',
                result: false,
                messages: ['ints not equal'],
                errors: []
            },
            {name: 'testF', result: true, messages: [], errors: []},
            {name: 'testG', result: true, messages: [], errors: []},
            {name: 'testH', result: true, messages: [], errors: []},
            {name: 'testI', result: true, messages: [], errors: []},
            {name: 'testJ', result: true, messages: [], errors: []},
            {
                name: 'testK',
                result: false,
                messages: ['stack overflow'],
                errors: []
            },
            {name: 'testL', result: true, messages: [], errors: []},
            {name: 'testM', result: true, messages: [], errors: []},
            {name: 'testN', result: false, messages: ['fail'], errors: []},
            {name: 'testO', result: true, messages: [], errors: []}];

        var mockContract = new MockMegaContract();
        var testRunner = new TestRunner("mockMegaContract", mockContract);
        testRunner.on('methodsStarted', ms);
        testRunner.on('methodsDone', md);
        testRunner.run();

        function ms(error, tests) {
            assert.ifError(error);
            assert.deepEqual(tests, expectedTests, "Test list does not match.");
        }

        function md(error, testName, result) {
            assert.ifError(error);
            assert.strictEqual(testName, 'mockMegaContract', "Data from 'methodsStarted' is wrong.");
            assert.deepEqual(result, expectedResult, "Results does not match.");
            done();
        }

    });

});