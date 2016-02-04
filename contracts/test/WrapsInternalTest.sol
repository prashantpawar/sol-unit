import "../src/Test.sol";

// Wraps an internal multiplication function.
contract WrapsInternal {

    function mult(int a, int b) constant returns (int prod){
        prod = _mult(a, b);
    }

    function _mult(int a, int b) internal constant returns (int){
        return a*b;
    }

}

contract WrapsInternalTest is Test {

    int constant A = 10;
    int constant B = 20;
    int constant PROD = 200;

    WrapsInternal testee;

    function WrapsInternalTest(){
        testee = new WrapsInternal();
    }

    function testMult() {
        var prod = testee.mult(A, B);
        prod.assertEqual(PROD, "Did not multiply correctly.");
    }

}