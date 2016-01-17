import "../src/Asserter.sol";

contract GlobalsTest is Asserter {

    function testTimestamp(){
        assertUintNotZero(block.timestamp, "timestamp is zero");
    }



}