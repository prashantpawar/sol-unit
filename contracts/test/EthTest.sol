import "../src/Test.sol";

contract Acc {

    uint _sent;

    function f() {
        _sent += msg.value;
    }

    function sent() constant returns (uint) {
        return _sent;
    }

}

contract EthTest is Test {

    // Test method starts with 'test' and will thus be recognized (2).
    function testSend(){
        Acc acc = new Acc();
        acc.f.value(5)();
        acc.sent().assertEqual(5, "sent returns the wrong value");
        address(acc).assertBalanceEqual(5, "balance is wrong");
    }

}