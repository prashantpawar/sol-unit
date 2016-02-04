import "../src/Test.sol";

contract GlobalsTest is Test {

    function testTimestamp(){
        block.timestamp.assertNotZero("timestamp is zero");
    }

}