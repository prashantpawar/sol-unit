# solUnit

**Disclaimer: Do not download and use. This is not a production ready library. When it is done, it will be announced. ETA this month (july 2015)**

**Disclaimer: Running and using this libary is difficult. It is alpha software, and it uses an alpha client to test code written in a language (Solidity) that is still under heavy development.**

## Introduction

Unit testing framework for solidity contracts. It runs unit tests and does basic coverage analysis. It uses the eris-db/tendermint server for carrying out the tests (via its javascript bindings and utilities). 

It used to be based on Ethereum, but switching to our client broke Ethereum compatibility (naturally). This will likely be fixed, hopefully in time for release. Whether or not I will maintain compatibility depends largely on how stable their client and javascript API will be. Technically there's nothing standing in the way.

The name of this library is solUnit, because sUnit is the Smalltalk unit testing framework. Given that sunit or sUnit is easier to write, and that there is no chance of confusion since nobody has used (or unit-tested) smalltalk since the 90s, those aliases are used instead. The node package is called s-unit, which is again just an alias.

## Installing

Only tested on linux (Ubuntu 14.XY).

`npm install s-unit`

Use the `--global` flag to get the `sunit` command-line version.

You need an `eris-db` server running in order to do tests, and it needs to run a chain that uses the files provided in `./resources/defaultdb`. The easiest way to use this library as of now is by copying that folder somewhere, cd into that directory and run `eris-db .`, then keep that process running while working on the code/tests. That will use the same chain for every test you run, but unit tests really shouldn't depend on the current state of the chain.  

**Note (2015-07-14): As the eris-cli tool improves, it will be easier and easier to use. It will soon have commands for setting up standard (throw-away) test-chains that are compatible with this library. Stay tuned...**  

## Usage

You either run it from the terminal or from javascript.

### Terminal

The executable name is `sunit`. If you install it globally you should get it on your path. Try `$ sunit -V` and it should print the version.


```
$ sunit --help

  Usage: sunit [options] <test ...>

  Options:

    -h, --help       output usage information
    -V, --version    output the version number
    -c, --coverage   Calculate coverage. [default=false]
    -m, --debug      Print debugging info. [default=false]
    -r, --url <url>  Url to blockchain client. [default='http://localhost:1337/rpc']
    -d, --dir <dir>  Directory in which to do the tests. [default=current directory]
```

Example: `$ sunit -c ArrayTest CoinTest `

Test names are the test contract names. They should always end in `Test` (no extension). 

### Running from javascript

The base class is `SUnit`.

```
var SUnit = require('s-unit');

var tests = ['CoinTest', 'BallotTest', ... ];
var baseDir = './tests';
var erisdbURL = 'http://localhost:1337/rpc';
var doCoverage = true;

sUnit.on('suiteStarted', function(){ console.log("Starting tests!"); });
sUnit.on('suiteDone', function(){ console.log("Done!"); });

sUnit.start(tests, baseDir, erisdbURL, doCoverage);
```

- The first param of the start method, `tests`, is an array of tests to run.

- The second param, `baseDir`, is the directory where the compiled solidity files are.

- The third param, `erisdbURL`, is the URL to the eris-db rpc

- The fourth param, `doCoverage`, is whether or not coverage analysis should be done.

#### Events

`SUnit` uses events. It extends nodes `EventEmitter`, and the events you may listen to are these:

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

id: `'methodsStarted'` - The test methods in the current contract are being run.

callback params: `funcs` - A list of all the test functions that was discovered in the current contract, and will be run.

##### Methods done

id: `'methodsDone'` - The methods are done and the results (or errors) are in. 

callback params: `error`, `stats` - the test results.

**NOTE: The final stats object is still a WIP. It will contain a lot more useful information about each test.** 

![sol_unit_diag.png](https://github.com/androlo/sol-unit/blob/master/resources/docs/sol_unit_diag.png "SolUnit structure")

## Writing tests

The easiest way to start writing unit-test contracts is to look at the examples in `contracts/src`.

### Test contract format

The constraints for a unit testing contract right now (0.1.x) are these:

- Test-contracts must use the same name as the test target but end with `Test`. If you want to test a contract named `Arrays`, name the test-contract `ArraysTest`. If you want to test a contract named `Coin`, name the test-contract `CoinTest`, and so on.

- Test function names must start with `test`, e.g. `function testAddTwoInts()`, and they must be public. There is no limit on the number of test-functions that can be in each test-contract.

- The test-contract needs a test event: `event TestEvent(address indexed fId, bool indexed result, uint indexed error, bytes32 message);`. It is used by the framework to validate that a test did indeed pass. The recommended way of doing unit tests is to have the test-contract extend `Asserter`, by importing `Asserter.sol` (comes with the library). Its assertion methods has a proper test event already set up which will fire automatically when an assertion is made. 

NOTE: If none of the existing assertions fit then it is always possible to extend the Asserter.sol contract or to calculate the result in the test-function and use `assertTrue` or `assertFalse`.

- If you want to do coverage analysis, the target contract field must be named `testee`. See example below.

- Currently, only one assertion/test-event per test method is allowed, and only one `testee` per test contract.

**Example of a simple storage value test with coverage enabled**

```
import "assertions/Asserter.sol";

contract Demo {
    
    uint public x = 0;
    
    function setX(uint _x){
        x = _x;
    }
}

// Test contract named DemoTest as per (1).
contract DemoTest is Asserter {

    uint constant TEST_VAL = 55;

    // We name this contract 'testee' so that we may do coverage analysis.
    Demo testee = new Demo();
    
    // Test method starts with 'test' and will thus be recognized by solUnit (2).
    function testSetX(){
        testee.setX(TEST_VAL);
        // Public accessor for 'x'.
        var x = testee.x();
        // Use assert method from Asserter contract (3). It will automatically fire the test event.
        assertUintsEqual(x, TEST_VAL, "Values are not equal");
    }
    
}
```

There is plenty more in the `contracts/src` folder. It's actually not that hard once eris-db and a system for compiling Solidity is properly set up. All test contracts looks pretty much the same - a target named 'testee' and a few methods that begin with 'test' and has an assertion in it.

### Build constraints

These are the rules for compiling.

- The `.binary` and `.abi` files for the test contracts must be available in the working directory (it doesn't need the source files).

- For coverage, the `.ast` file of the test contract, and `.abi` file of the "testee" must be in the working directory as well. 

The easiest way possible is to just compile everything with `--binary file --json-abi file --ast-json file`. That will give you all the needed files (and a number of non-needed ones as well).

#### Tips on building solidity projects

There's a contract build automation script in the gulpfile that uses my [gulp-smake](https://github.com/androlo/gulp-smake) tool to automate building. It will be more advanced and more standardized with time. What it does is it copies all the sources into a temporary folder, compiles them, moves the compiled files into a build folder and then finishes up by removing the temp. The reason it uses temp is because later it might want to pull in source files from other projects to use when building, and those should not be persisted in the base source folder. Also, their sources will be added to a folder inside the temporary root folder with the same name/id as the project, so if I pull in the s-unit assertions library, and its source folder only contains the file `Asserter.sol`, it would end up in the temporary source folder as `temp_sources/assertions/Asserter.sol`. This will make dependency management a lot easier.  

The goal with all of this is to eventually have a good solidity contract build task that can be chained with a unit testing task so that all the building and testing of contracts can be integrated with the rest.

### TestEvent and assertions

`TestEvent` is what the framework listens too. It will run test functions and then listen to `TestEvent` data from the contract in question. Not having a test event won't break the contract code, but the framework won't be able to tell whether or not the tests succeed.

`event TestEvent(address indexed fId, bool indexed result, uint indexed error, bytes32 message);`

The `fId` param is the function id (`msg.sig`) which is passed along to identify the method being called. For technical reasons it uses the `address` type.   

The `result` param is the result of the test. Basically if the assertion succeeded or failed. It's always a boolean.

The `error` param is **not used** right now, but will be used for error/exception handling by allowing error codes to be sent.

The `message` param is used to log a message. This is normally used if the assertion fails. It must be less then 32 bytes.

If the contract extends `Asserter`, it will inherit `TestEvent`, and can also use the assert methods which will automatically trigger the test event. Otherwise you can just roll your own. 

**Example of a bare-bones test contract**
 
```
contract Something(){
    
    int public something;
    
    function setSomething(int _something){
        something = _something;
    }
}

contract SomethingTest {

    event TestEvent(address indexed fId, bool indexed result, uint indexed error, bytes32 message);
    
    Something testee = new Something();
    
    function testSomething(){
        int someValue = 5; 
        testee.setSomething(someValue);
        var intOrSomeSuch = testee.something();
        var result = (intOrSomeSuch == someValue);
        if(result){
            TestEvent(msg.sig, true, 0, "");
        } else {
            TestEvent(msg.sig, false, 0, "Something is wrong.");
        }
    }

}
```

## Examples

The contracts folder comes with a couple of different examples.

## Tests

Cut out most of the tests with the update, as they were centered around Ethereum. Will add new tests gradually. Basic coverage should be done before release.

## Library structure

The framework uses blockchain-client events to do the tests. It uses the afore-mentioned Solidity `TestEvent` to get confirmation from contract methods.

The `SUnit` class is where everything is coordinated. It deploys the test contracts and publish the results via events. It implements nodes EventEmitter. It also relays some events from dependencies like the `TestRunner` and `Analyzer` (coverage tool).

The `TestRunner` takes a test contract, finds all test methods in it and run those. It also sets up a listener for solidity events and usees those events to determine if a test was successful or not, and when all the tests has finished. It is normally instantiated and managed by a `SUnit` object.

The `Analyzer` uses a test contract AST and its targets ABI to determine how many of the methods has been called. It does not look for hidden methods, or how they are called from the public ones, but that might be added later.

In the state machine diagram, the executable would gather tests and set things up, then `SUnit` would deal with the contract execution section. The `Analyzer` is not part of this diagram because it has no effect on the general program structure (it's just a synchronous post-processing step).

Presentation of test data is not part of the diagram either. `SUnit` does no presentation of its own - it only passes the data back through the events. The way reporting works with the command-line tool is it listens to all the SUnit events and prints the reported data using a special test-logger.

