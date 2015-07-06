# sUnit

**Disclaimer: Do not download and use. This is not a production ready library. When it is done, it will be announced.**

Running and using this libary is difficult. It is alpha software, and it uses an alpha client to test code written in a language (Solidity) that is still under heavy development.

## Introduction

Unit testing framework for solidity contracts. It runs unit tests and does basic coverage analysis. It uses the eris-db/Tendermint server via its javascript bindings and utilities.

## Installing

`npm install s-unit`

Requires cpp-ethereum (latest dev) to function. At the very least it needs the solidity compiler. Instructions for installing can be found here: `https://github.com/ethereum/cpp-ethereum/wiki`. If you're unfamiliar with cpp-ethereum, or ethereum in general, or uncomfortable being on latest dev, then this tool is probably not useful.

When Ethereum has been downloaded and installed, check that you are able to run `solc --version` from some directory (doesn't matter which).

**NOTE: You need to keep cpp-ethereum up to date. Always make sure you're on latest dev.**

## Unit test format

The constraints for a unit testing contract right now (0.1.x) are these:

- Unit test contracts has a name that ends with `Test`, e.g. `ArraysTest.sol`, `CoinTest.sol`.

- Test function names must start with `test`, e.g. `function testAddTwoInts()`, and they must be public.

- The test contract has to have a field called `testee`, which is where it stores a reference to the tested contract.

-The test contract needs a test event: `event TestEvent(address indexed fId, bool indexed result, uint indexed error, bytes32 message);`. This needs to be in the ABI of the unit test contract, and is used from the javascript to validate that a test did indeed pass.

The recommended way of doing unit tests is to have the unit test contract extend `Asserter`, by importing `asserter.sol` (comes with the library). Its assertion methods has the proper test event already set up. If you want to do it without Asserter, or make your own assertions contract(s), or simply add a test-event to your unit testing contract. 

**Working example of a simple storage value test**

```
contract C {
    uint public x = 0;
    function setX(uint _x){
        x = _x;
    }
}

contract TesteeTest {
    uint constant testVal = 55;

    C testee;
    
    function TesteeTest(){
        testee = new C();
    }
    
    function testSomething(){
        testee.setX(testVal);
        
    }
}
```

### Build constraints

- The `.binary` and `.abi` files for the test contracts and their 'testee' must be available in the working directory. If you run the executable, the working directory will be the directory in which you run it.

- The `.binary` file must end with `Test`, which (as of now) means the contract must do so as well. Example: If the testee is `Mycoin`, then the unit testing contract must be named `MycoinTest`, which means the compiled output will be `MycoinTest.binary`.



- Only one assertion per test method is allowed.

Examples can be found in the `contracts` folder.

### Coverage analysis

** *NOTE: Re-designing this so it is currently un-available.* **

Coverage analyis is done using the json ast & abi of both the test contract and testee, which means those must exist in the same folder as the .binary file.

The `Test` contract must have a field named `testee`, which is the contract that is being tested, ie `Mycoin testee;` (this is used in coverage analysis).

## TestEvent and assertions

`TestEvent` is what the framework listens too. 

The `fId` param is the function id (`msg.sig`) which is passed along to identify the method being called. For technical reasons it uses the `address` type.   

The `result` param is the result of the test. Basically if the assertion succeeded or failed. It's always a boolean.

The `error` param is not used right now, but will be used for error/exception handling by allowing error codes to be sent.

The `message` param is used to log a message. This is normally used if the assertion fails. It must be less then 32 bytes.

If the contract extends `Asserter`, it will inherit `TestEvent`, and can also use the assert methods which will automatically trigger the test event. 

## Examples

The contracts folder comes with a couple of different examples.

## Tests

TODO mock.