import "../src/Asserter.sol";

library TestLibAddDep {

    function add(int a, int b) constant returns (int sum) {
        return a + b;
    }

}

library TestLibAdd {

    function add(int a, int b) constant returns (int sum) {
        return TestLibAddDep.add(a,b);
    }

}

library TestLibMult {

    function mult(int a, int b) constant returns (int product) {
        return a * b;
    }

}

contract LibUser {

    function add(int a, int b) constant returns (int sum) {
        return TestLibAdd.add(a, b);
    }

    function mult(int a, int b) constant returns (int product) {
        return TestLibMult.mult(a,b);
    }

}

contract LibTest is Asserter {

    function testAdd(){
        var lu = new LibUser();
        var sum = lu.add(5, 6);
        assertIntsEqual(sum, 11, "sum is not right.");
    }

    function testMult(){
        var lu = new LibUser();
        var sum = lu.mult(5, 6);
        assertIntsEqual(sum, 30, "product is not right.");
    }
}