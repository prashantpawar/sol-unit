# sUnit

**Disclaimer: Running and using this library is difficult. It is alpha software, and it uses an alpha client to test code written in a language (Solidity) that is still under development.**

## Introduction

sUnit (solUnit) is a unit testing framework for Solidity contracts. It runs unit tests against [javascript Ethereum](https://github.com/ethereumjs).

The name of this library is solUnit, because sUnit is the Smalltalk unit testing framework, but because there is no chance of confusion (nobody has unit-tested Smalltalk since the 90s) those aliases are sometimes used instead. The node package is called s-unit, but the github repo is sol-unit.

**NOTE**: Static coverage analysis (parsing syntax trees) has been removed in `0.3` to be replaced by runtime analysis later. I plan on adding other analytics tools as well, with the new VM and all... 

## Installing

Only tested on linux (Ubuntu 14.04, 14.10, 15.04).

`npm install s-unit`

Use the `--global` flag to get the `sunit` command-line version into PATH.

## Usage

The executable name is `sunit`. If you install it globally you should get it on your path. Try `$ sunit -V` and it should print out the version.

To see all the options:

```
$ sunit --help

  Usage: sunit [options] <test ...>

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -m, --debugMessages  Print debugging information. [default=false]
    -d, --dir <dir>      Directory in which to do the tests. [default=current directory]
```

Example: `$ sunit -c ArrayTest CoinTest` will look for those tests in the current directory.

Test names are the test contract names. They should always end in `Test` (no extension). 

The library can be run from javascript as well:

```
var SUnit = require('s-unit');

var tests = new SUnit();

// Need to set event listeners up manually. 
  
sUnit.on('suiteStarted', function(error, tests){console.log(tests)});
sUnit.on('contractStarted', someFunc);
// ...

tests.start(['ArrayTest', 'CoinTest'], 'rootdir');
```

Event-listeners are documented in the library structure section near the bottom of this document.

## Motivation

Unit testing Solidity using Solidity has the same benefits as unit testing anything else. It is perfect for doing input validation and other things, to complement formal analysis etc. 

Calling contracts from javascript (web3.js in a web-page or alethzero) is integration testing, not unit testing. A good project should in my opinion have both.

## Writing tests

The easiest way to start writing unit-testing contracts is to look at the examples in `contracts/src`.

### Test format

The rules for a unit testing contract right now (0.3.x) are these:

1. Test-contracts must use the same name as the test target but end with `Test`. If you want to test a contract named `Arrays`, name the test-contract `ArraysTest`. If you want to test a contract named `Coin`, name the test-contract `CoinTest`, and so on.

2. Test function names must start with `test`, e.g. `function testAddTwoInts()`, and they must be public. There is no limit on the number of test-functions that can be in each test-contract.

3. The test-contract may use a test event: `event TestEvent(bool indexed result, string message);`. The recommended way of doing unit tests is to have the test-contract extend `Asserter`, by importing `Asserter.sol` (comes with the library). Its assertion methods has a proper test event already set up which will fire automatically when an assertion is made. There is no limit on the number of assertions in a test method.

NOTE: If none of the existing assertions would fit, extend the Asserter.sol contract or calculate the result in the test-function and use `assertTrue` or `assertFalse`.

- A test **passes** if no assertion fails (i.e. `result` is `true` in every test event). If no assertions are made, the test will pass automatically. If at least one assertion fails, the test will **not pass**.

**Example of a simple storage value test**


```
import "./assertions/Asserter.sol";

contract Demo {
    
    uint _x = 0;
    
    function setX(uint x){
        _x = x;
    }
    
    function getX() constant returns (uint x){
        return _x;
    }
}

// Test contract named DemoTest as per (1).
contract DemoTest is Asserter {

    uint constant TEST_VAL = 55;
    
    // Test method starts with 'test' and will thus be recognized (2).
    function testSetX(){
        Demo demo = new Demo();
        assertAddressNotZero(address(demo), "Failed to deploy demo contract");
        demo.setX(TEST_VAL);
        var x = demo.getX();
        // Use assert method from Asserter contract (3). It will automatically fire off a test event.
        assertUintsEqual(x, TEST_VAL, "Values are not equal");
    }
    
}
```

There is plenty more in the `contracts/src` folder. It's actually not that hard once eris-db is properly set up. All test contracts looks pretty much the same - a target named 'testee' and a few methods that begin with 'test' and has an assertion in it.

### Build constraints

The `.bin` and `.abi` files for the test contracts must be available in the working directory.

*Example*

I want to unit test a contract named `Bank`. I create `BankTest`, compile the sources, and make sure the following files are created: `BankTest.bin`, `BankTest.abi`.

To make sure I get all of this, I compile with: `solc --bin --abi -o . BankTest.sol`. They will end up in the same folder as the sources in this case.

### TestEvent and assertions

`TestEvent` is what the framework listens too. It will run test functions and then listen to `TestEvent` data from the contract in question.

`event TestEvent(address indexed fId, bool indexed result, uint error, bytes32 indexed message);`

The `fId` param is the function id (`msg.sig`) which is passed along to identify the method being called. For technical reasons it uses the `address` type.   

The `result` param is the result of the test. Basically if the assertion succeeded or failed. It's always a boolean.

The `error` param is not used right now, but will be used for error/exception handling by allowing error codes to be sent.

The `message` param is used to log a message. This is normally used if the assertion fails. It must be less then 32 bytes atm.

If the contract extends `Asserter`, it will inherit `TestEvent`, and can also use the assert methods which will automatically trigger the test event. Otherwise you can just roll your own. 

**Example of a bare-bones test contract**

```
contract Something {
    
    int _something;
    
    function setSomething(int something){
        _something = something;
    }
    
    function something() constant returns (int something){
        return _something;
    }
}

contract SomethingTest {

    event TestEvent(bool indexed result, string message);
    
    function testSomething(){
        Something testee = new Something();
        int someValue = 5; 
        testee.setSomething(someValue);
        var intOrSomeSuch = testee.something();
        var result = (intOrSomeSuch == someValue);
        if(result){
            TestEvent(true, "");
        } else {
            TestEvent(false, "Something is wrong.");
        }
    }

}
```

## Examples

The contracts folder comes with a number of different examples.

## Tests

`mocha` or `npm test`.

It is also possible to run the executable from the `./contracts/build` folder, either `sunit` if it is installed globally, or `../../bin/sunit.js`. 

## Library structure

The framework uses blockchain-client events to do the tests. It uses the afore-mentioned Solidity `TestEvent` to get confirmation from contract methods.

The `SUnit` class is where everything is coordinated. It deploys the test contracts and publish the results via events. It implements nodes EventEmitter. It forwards some of these events from dependencies like the `TestRunner`, which is also an emitter.

The `TestRunner` takes a test contract, finds all test methods in it and run those. It also sets up a listener for solidity events and uses those events to determine if a test was successful or not. It is normally instantiated and managed by a `SUnit` object.

![sol_unit_diag.png](https://github.com/androlo/sol-unit/blob/master/resources/docs/sol_unit_diag.png "SolUnit structure")

In the diagram, the executable would gather tests and set things up, then `SUnit` would deal with the contract execution section.

Presentation of test data is not part of the diagram. The core `SUnit` library does not present - it only passes data through events. The way presentation works in the command-line tool is it listens to all SUnit events and prints the reported data using a special test-logger.

#### Events

`SUnit` extends Node.js' `EventEmitter`. 

The events you may listen to are these:

##### Suite started

id: `'suiteStarted'` - The suite has started. 
 
callback params: `error`, `tests` - array of test names. Keep in mind these may not be the same as you entered, because some may not have existed or you could have skipped the names so that it found all tests in the directory. This is the list of tests (test contracts) that was actually found.

##### Suite done
 
id: `'suiteDone'` - The suite is done. 
 
callback params: `stats` - collection of stats for all test contracts.
 
##### Contracts started
 
id: `'contractStarted'` - A new test contract is starting. 

callback params: `error`, `testName` - the test name.
 
##### Contracts done

id: `'contractDone'` - A contract is done. 

callback params: `error`

##### Methods started

id: `'methodsStarted'` - The test methods in the current contract are about to be run.

callback params: `methodNames` - A list of all the test functions that was discovered in the current contract, and will be run.

##### Methods done

id: `'methodsDone'` - The methods are done. 

callback params: `error`, `results` - the combined test-results.
 
##### Method started

id: `'methodStarted'` - A test method in the current contract are being run.

callback params: `methodName` - The name of the method.

##### Method done

id: `'methodDone'` - The method is done and the results are in. 

callback params: `results` - the test results. 