import "../src/Test.sol";

contract BasicTypes {

    address public ownerF;
    bytes32 public bytes32F;
    int public intF;
    uint public uintF;
    bool public boolF;

    function BasicTypes(){
        ownerF = msg.sender;
    }

    function setBytes32F(bytes32 bytes32In){
        bytes32F = bytes32In;
    }

    function setIntF(int intIn){
        intF = intIn;
    }

    function setUintF(uint uintIn){
        uintF = uintIn;
    }

    function setBoolF(bool boolIn){
        boolF = boolIn;
    }

}

contract BasicTypesTest is Test {

    bytes32 constant bytes32Out = 0x111111;
    int constant intOut = -1234;
    uint constant uintOut = 1234;
    bool constant boolOut = true;

    function BasicTypesTest(){

    }

    function testOwner() {
        var testee = new BasicTypes();
        var owner = testee.ownerF();
        // Fail deliberately.
        owner.assertZero("Owner is not caller");
    }

    function testBytes32() {
        var testee = new BasicTypes();
        testee.setBytes32F(bytes32Out);
        var bytes32In = testee.bytes32F();
        bytes32Out.assertEqual(bytes32In, "Bytes32 did not match.");
    }

    function testInt() {
        var testee = new BasicTypes();
        testee.setIntF(intOut);
        var intIn = testee.intF();
        intOut.assertEqual(intIn, "Ints did not match.");
    }

    function testUint() {
        var testee = new BasicTypes();
        testee.setUintF(uintOut);
        var uintIn = testee.uintF();
        uintOut.assertEqual(uintIn, "Uints did not match.");
    }

    function testBool() {
        var testee = new BasicTypes();
        testee.setBoolF(boolOut);
        var boolIn = testee.boolF();
        boolOut.assertEqual(boolIn, "Bools did not match.");
    }

}