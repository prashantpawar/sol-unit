var assert = require('assert');
var TestRunner = require('../lib/test_runner');

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
            message: "ints not equal"
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
            message: "stack overflow"
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
            message: "fail"
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

var mockEventSigError = {
    args: {
        fId: "11111112",
        result: true,
        error: 0,
        message: ""
    }
};

var MockSub = function(){
  this.stop = function(){}
};

var MockContract = function () {

    this.TestEvent = function (startCallback, callback) {
        startCallback(null, new MockSub);
        callback(null, mockEvent);
    };

    this.testMock = function () {
    };

    this.testMock.signature = function () {
        return "11111111";
    };

    this.abi = abi;
};

var MockContractEventParseError = function () {

    this.testMock = function () {
    };

    this.testMock.signature = function () {
        return "11111111";
    };

    this.abi = abiEventFail;
};

var MockContractNoTestFuncsError = function () {

    this.testMock = function () {
    };

    this.testMock.signature = function () {
        return "11111111";
    };

    this.abi = abiNoTestFuncs;
};

var MockContractSigError = function () {

    this.TestEvent = function (startCallback, callback) {
        startCallback(null, new MockSub);
        callback(null, mockEventSigError);
    };

    this.testMock = function () {
    };

    this.testMock.signature = function () {
        return "11111111";
    };

    this.abi = abi;
};

var MockContractSolidityError = function () {

    this.TestEvent = function (startCallback, callback) {
        startCallback(null, new MockSub);
        callback(new Error('Mock error'));
    };

    this.testMock = function () {
    };

    this.testMock.signature = function () {
        return "11111111";
    };
    this.abi = abi;
};

var MockMegaContract = function () {
    var calls = 0;
    this.TestEvent = function (startCallback, callback) {
        startCallback(null, new MockSub);
        for (var i = 0; i < 15; i++) {
            callback(null, mockMegaEvents[i]);
        }
    };

    this.testA = function () {
    };

    this.testB = function () {
    };

    this.testC = function () {
    };

    this.testD = function () {
    };

    this.testE = function () {
    };

    this.testF = function () {
    };

    this.testG = function () {
    };

    this.testH = function () {
    };

    this.testI = function () {
    };

    this.testJ = function () {
    };

    this.testK = function () {
    };

    this.testL = function () {
    };

    this.testM = function () {
    };

    this.testN = function () {
    };

    this.testO = function () {
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
                message: '',
                error: ''
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

    it("Should fail due to to a function signature error", function (done) {
        var mockContract = new MockContractSigError();
        var testRunner = new TestRunner("mockContractSigError", mockContract);
        testRunner.on('methodsStarted', ms);
        testRunner.on('methodsDone', md);
        testRunner.run();

        function ms(error, tests) {
            assert.ifError(error);
            assert.deepEqual(tests, [{name: 'testMock', sig: '11111111'}], "Data from 'methodsStarted' is wrong.");
        }

        function md(error, testName, result) {
            assert(error, "Did not get an error from 'methodsStarted' listener");
            assert.equal(error.message, "Error: did not recognize test function signature: 11111112");
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
            assert(error, "Did not get an error from 'methodsStarted' listener");
            assert.equal(error.message, "Solidity TestEvent returned an error: Mock error");
            done();
        }
    });

    it("Should complete a successful larger test", function (done) {

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

        var expectedResult = [{name: 'testA', result: true, message: '', error: ''},
            {name: 'testB', result: true, message: '', error: ''},
            {name: 'testC', result: true, message: '', error: ''},
            {name: 'testD', result: true, message: '', error: ''},
            {
                name: 'testE',
                result: false,
                message: 'ints not equal',
                error: ''
            },
            {name: 'testF', result: true, message: '', error: ''},
            {name: 'testG', result: true, message: '', error: ''},
            {name: 'testH', result: true, message: '', error: ''},
            {name: 'testI', result: true, message: '', error: ''},
            {name: 'testJ', result: true, message: '', error: ''},
            {
                name: 'testK',
                result: false,
                message: 'stack overflow',
                error: ''
            },
            {name: 'testL', result: true, message: '', error: ''},
            {name: 'testM', result: true, message: '', error: ''},
            {name: 'testN', result: false, message: 'fail', error: ''},
            {name: 'testO', result: true, message: '', error: ''}];

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