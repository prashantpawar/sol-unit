import "assertions/Asserter.sol";

contract SystemUtils {

    address public owner;

    function SystemUtils() {
      owner = msg.sender;
    }

    function whoAmI1() returns (address) {
      return owner;
    }

    function whoAmI2() returns (address) {
      return msg.sender;
    }
}

contract SystemUtilsTest is Asserter {

    SystemUtils testee = new SystemUtils();

    function testWhoAmI(){
        var a0 = testee.whoAmI1();
        var a1 = testee.whoAmI2();
        assertAddressesEqual(a0, a1, "addresses does not match.");
    }

}