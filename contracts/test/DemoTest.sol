import "../src/Test.sol";

contract Demo {

    uint public x = 0;

    function setX(uint _x){
        x = _x;
    }
}

// Test contract named DemoTest as per (1).
contract DemoTest is Test {

    uint constant TEST_VAL = 55;

    // Test method starts with 'test' and will thus be recognized (2).
    function testSetX(){
        Demo demo = new Demo();
        demo.setX(TEST_VAL);
        // Public accessor for 'x'.
        var x = demo.x();
        // Use assert method from Assertions library (3). It will automatically fire off a test event.
        x.assertEqual(TEST_VAL, "Values are not equal");
    }

}