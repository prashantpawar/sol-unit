import "../src/Test.sol";

contract Thrower {

    function doThrow(){
        throw;
    }

}

contract ThrowerTest is Test {

    function testThrow(){
        new Thrower().doThrow();
    }

}

