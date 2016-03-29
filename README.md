# sol-unit

Unit tests for Solidity contracts.

News (2016-01-30) - There is now a library version of the `Asserter` contract called `Assertions`. It will become the standard, but the old syntax will continue to be supported.

**Disclaimer: Running and using this library is difficult. It is alpha software, and it uses an alpha client to test code written in a language (Solidity) that is still under development. The library should be considered experimental.**

## Table of Content

1. [Introduction](#introduction)
2. [Installation and Usage](#installation-and-usage)
3. [Writing tests](#writing-tests)
4. [Examples](#examples)
5. [Assertions](#assertions)
6. [Testing and Developing](#testing-and-developing)
7. [Program structure](#program-structure)
8. [FAQ](#faq)

## Introduction

solUnit is a unit testing framework for Solidity contracts. It runs unit tests against [javascript Ethereum](https://github.com/ethereumjs).

The tests are run in a controlled environment, using extremely high gas-limit and a standard account with an extreme amount of Ether. More blockchain/VM settings will become available with time, along with extra analysis tools.

**NOTE**: Static coverage analysis (parsing syntax trees) was removed in `0.3` to be replaced with runtime analysis at some later date.

## Installation and Usage

Officially supported on 64 bit Ubuntu (14.04, 14.10, 15.04).

`npm install sol-unit`

Use the `--global` flag to install the `solunit` command-line version.

#### Command-line

The executable name is `solunit`. If you install it globally you should get it on your path. Try `$ solunit -V` and it should print out the version.

To see all the options run `solunit -h`.

Example: `$ solunit ArrayTest BasicTypesTest` will look for `.bin` and `.abi` files for those test-contracts in the current directory. Simply typing `solunit` will run all tests found in the current directory. Test-contracts must always end in `Test`.

#### Library

The library can be run from javascript as well:

```
var sUnit = require('sol-unit');

// ...

sUnit.runTests(['ArrayTest', 'BasicTypesTest'], 'dirWithTestsInThem', true, function(error, stats){
    console.log(error);
    console.log(stats);
});
```

* First param is an array of strings of the test names.
* Second param is the directory in which the tests `.bin` and `.abi` files can be found.
* Third is whether or not to print test data (looks similar to mocha).
* Fourth is an error first callback that returns test statistics.

The stats object contains a `testUnits` field which has data of all the test units in them, along with a `total` and `successful` field which is the total number of tests and the number of tests that succeeded, respectively. There is also a `skippedUnits` field where contracts that did not load properly end up (they are mapped to their error messages). Finally there's the total number of test units (contracts), and the number that was skipped.

```
{
    testUnits: {
        ArrayTest: TestResults,
        BasicTypesTest: TestResults
    }
    skippedUnits: {
        IAmNotHereTest: <string>
    }
    successful: 15,
    total: 16,
    numTestUnits: 3,
    numSkippedUnits: 1
}
```

`TestResults` is an object with all the test functions of the test contract in it, mapped to a simple struct containing:

1. The name of the test.
2. The result (true if all assertions in the function were true, otherwise false).
3. The messages of any failed assertions.
4. Error messages (currently not used).

```
TestResults = {
    testPop: { name: 'testPop', result: false, messages: ["Array length not 1"], errors: [] },
    testPush: { name: 'testPush', result: true, messages: [], errors: [] },
    ...
}
```

Event-listeners are documented in the library structure section near the bottom of this document.

## Writing tests

The easiest way to start writing unit-testing contracts is to look at the examples in `contracts/src`.

### Test format

The rules for a unit testing contract right now (0.5.x) are these:

1. Test-contracts must use the same name as the test target but end with `Test`. If you want to test a contract named `Arrays`, name the test-contract `ArraysTest`. If you want to test a contract named `Coin`, name the test-contract `CoinTest`, and so on.

2. Test function names must start with `test`, e.g. `function testAddTwoInts()`, and they must be public. There is no limit on the number of test-functions that can be in each test-contract.

3. The test-contract may use a test event: `event TestEvent(bool indexed result, string message);`. The recommended way of doing unit tests is to have the test-contract extend `Test`, by importing `Test.sol` (this contract comes with the library). Extending `Test` will connect your test contract with the `Assertions` library, and its assertion methods has a proper test event already set up. There is no limit on the number of assertions that can be made in a test method.

NOTE: If none of the existing assertions would fit you could modify `Test.sol` and `Assertions.sol` for your project, or just calculate the result in the test-function and use `assertTrue` (or simply `assert`), or `assertFalse`.

- A test **passes** if no assertion fails (i.e. `result` is `true` in every test event). If no assertions are made, the test will automatically **pass**. If at least one assertion fails, the test will **not pass**.

**Example of a simple storage value test**

```
import "Test.sol";

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
contract DemoTest is Test {

    uint constant TEST_VAL = 55;
    
    // Test method starts with 'test' and will thus be recognized (2).
    function testSetX(){
        Demo demo = new Demo();
        demo.setX(TEST_VAL);
        
        // Assert methods bound to type. Assertions will automatically fire off a test event (3).
        demo.getX().assertEqual(TEST_VAL, "Values are not equal");
    }
    
}
```

There is plenty more in the `contracts/src` folder. All test contracts looks pretty much the same - a target contract and a few methods that begin with 'test' and has assertions in them.

### Build constraints

The `.bin` and `.abi` files for the test contracts must be available in the working directory.

*Example*

I want to unit test a contract named `Bank`. I create `BankTest`, compile the sources, and make sure the following files are created: `BankTest.bin`, `BankTest.abi`.

To make sure I get all of this, I compile with: `solc --bin --abi -o . BankTest.sol`. They will end up in the same folder as the sources in this case.

If library contracts are involved, their `.bin` files must be included in the test directory. `sol-unit` does automatic linking.

## Examples

The contracts folder comes with a number of different examples.

## Assertions

The assertions can be found in the assertions library (`./contracts/src/Assertions.sol`). It is very well documented.

All assertions are called as function on the values/references in question. The last param of an assert function is always a message to display if the assertion fails.

Some common assertions on arrays and other reference types are not supported, but will continuously be added as Solidity evolves. Templates really is the bottleneck here.

### List of assertions

#### string

`assertEqual`, `assertNotEqual`, `assertEmpty`, `assertNotEmpty`

#### bytes32 / address

`assertEqual`, `assertNotEqual`, `assertZero`, `assertNotZero`

Examples:

```
bytes32 b = "hello";
b.assertNotZero("something is seriously wrong");
```

```
address a = "0x12345";
address b = "0xABCDE"
a.assertNotEqual(b, "Something is seriously wrong");`
```

#### int / uint

`assertEqual`, `assertNotEqual`, `assertGT`, `assertGTOE`, `assertLT`, `assertLTOE`, `assertZero`, `assertNotZero`

GT = Greater Than
 
GTOE = Greater Than Or Equal 

LT = Less Than, 

LTOE = Less Than Or Equal

Examples:

```
uint x = 7;
uint y = 15;
uint z = 15;

x.assertNotEqual(y, "something is wrong");
y.assertNotEqual(x, "something is wrong");
y.assertEqual(z, "something is wrong");

x.assertLT(y, "something is wrong");
y.assertGT(x, "something is wrong");
y.assertLTOE(z, "something is wrong");
```

#### bool

`assertTrue (assert)`, `assertFalse`, `assertEqual`, `assertNotEqual`

Both `assertTrue` and `assert` can be used to assert that a value is true.

Examples:

```
true.assertTrue("something is wrong");
true.assert("something is wrong");

uint x = 5;
uint y = 3;

(x + y == 8).assert("addition isn't working");

(x + y == 8).assertEqual((y + x == 8), "math isn't working.");

false.assertFalse("something is wrong");
```

#### Account balance

`assertBalanceEqual`, `assertBalanceNotEqual`, `assertBalanceZero`, `assertBalanceNotZero`

Can be used to check ether balance.

Examples:

```
msg.sender.assertBalanceNotZero("Caller is broke. Error code: 0xDEADBEA7");

```

#### error (uint16)

`assertError`, `assertNoError`, `assertErrorsEqual`, `assertErrorsNotEqual`

Utility for when error codes are returned as 16 bit unsigned integers, and 0 = no error.

`funcThatReturnsErrorCode(someParam).assertNoError("Function returned an error");`

TODO test and add in the array assertions.

## Testing and Developing

`mocha` or `npm test` to run library tests.

The library comes with a set of test-contracts as well. You can test them by running the solunit executable from the `./contracts/build` folder, either `solunit` if it is installed globally, or `../../../bin/solunit.js` to use the local version. NOTE: One test always fails just to show how it looks.

You can compile contracts if you have `solc` on your path, either by running `build_contracts.sh` or `gulp build-contracts`.

## Program structure

The framework uses Solidity events (log events) to do the tests. It uses the afore-mentioned Solidity `TestEvent` to get confirmation from contract test-methods.

The `SUnit` class is where everything is coordinated. It deploys the test contracts and publish the results via events. It implements nodes EventEmitter. It forwards some of these events from dependencies like the `TestRunner`, which is also an emitter.

The `TestRunner` takes a test contract, finds all test methods in it and run those. It also sets up a listener for solidity events and uses those events to determine if a test was successful or not. It is normally instantiated and managed by a `SUnit` object.

![sol_unit_diag.png](https://github.com/androlo/sol-unit/blob/master/resources/docs/sol_unit_diag.png "SolUnit structure")

In the diagram, the executable gathers the tests and set things up, then `SUnit` deal with the contract execution part.

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
 
## FAQ

"frequently" asked questions.

---

**Q**: Why bother with sol-unit tests?

**A**: They are a clean and easy way of verifying that contract code is working.

---

**Q**: I can test contracts by deploying them and doing a series of calls and transactions from web3/embark/truffles/eris/etc. Isn't that the same as using sol-unit?

**A**: No. sol-unit tests are unit tests. Unit tests are normally written in the same language as the tested code, compiled together with that code, and run in the same process. The tests you do with those frameworks are integration tests and they introduce many external factors that can affect the test results. 

---

**Q**: Are sol-unit tests better then integration tests? 

**A**: No, they are a complement.

---

**Q**: If all sol-unit does is run the contract code, why not just compile the contracts and pass them to ethvm myself?

**A**: sol-unit lets you write tests as you would any other contracts, write assertions, and test it like you would any other code. Everything that's needed to run a test contract is contained within the contract itself. This makes it easier to write tests, and also makes it easier for others to see what the tests actually do.

---

**Q**: What if I want to get gas cost, and other such data?

**A**: The goal is to support that as well. It's not very hard to add, and is already done by other tools (browser-solidity for example).

---

**Q**: What about parametrized tests?

**A**: I have played around with annotations and other things, but decided to only support basic, no-argument test functions for now.

---

**Q**: Why does it not build in Windows?

**A**: The library uses the Ethereum javascript VM, which uses native extensions. I might look into this.

---

**Q**: Is sol-unit made by Ethereum?

**A**: No. sol-unit is a weird, third party library.