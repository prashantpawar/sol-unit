import "assertions/Asserter.sol";

contract Array {

    int[5] public array;
    int[] public dynArray;

    function Array(){
    }

    function setElement(uint index, int val) external {
        array[index] = val;
    }

    function push(int val) external {
        var len = dynArray.length;
        dynArray.length += 1;
        dynArray[len] = val;
    }

    function pop() external returns (int val){
        var len = dynArray.length;
        val = dynArray[len - 1];
        dynArray.length -= 1;
    }

    function dynArrayLen() external returns (uint length){
        length = dynArray.length;
    }

    function resetDynArray(){
        dynArray.length = 0;
    }

}

contract ArrayTest is Asserter {

    int constant ARR_0 = 1;

    int constant PUSH_1 = 5;
    int constant PUSH_2 = 10;
    int constant PUSH_3 = 15;
    int constant PUSH_4 = 20;
    int constant PUSH_5 = 25;

    uint constant LEN = 3;

    Array testee = new Array();

    function testSetArray0(){
        testee.setElement(0, ARR_0);
        var arr0 = testee.array(0);
        assertIntsEqual(arr0, ARR_0, "array[0] does not match.");

    }

    function testPush(){
        testee.push(PUSH_1);
        testee.push(PUSH_2);
        testee.push(PUSH_3);
        var len = testee.dynArrayLen();
        assertUintsEqual(len, 65465, "length does not match.");
    }

    function testPop(){
        testee.push(PUSH_4);
        var pop = testee.pop();
        assertIntsEqual(pop, PUSH_4, "pop does not match.");
    }

    function testResetDynArray(){
        testee.resetDynArray();
        var len = testee.dynArrayLen();
        assertUintsEqual(len, 0, "length does not match.");
    }

    function testAccessDynArray(){
        testee.resetDynArray();
        testee.push(PUSH_5);
        var da0 = testee.dynArray(0);
        assertIntsEqual(da0, PUSH_5, "value does not match.");
    }
}