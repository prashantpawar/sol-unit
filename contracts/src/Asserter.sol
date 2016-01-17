/// @title Asserter
/// @author Andreas Olofsson (androlo1980@gmail.com)
/// @notice Assertions for unit testing contracts.
contract Asserter {

    /// @dev The test event is used to read the test results.
    /// @param result Whether or not the assertion holds. The result is always a boolean.
    /// @param message A message to write if the assertion fails.
    event TestEvent(bool indexed result, string message);

    /// @dev used internally to trigger the event.
    function report(bool result, string message) internal constant {
        if(result){
            TestEvent(true, "");
        } else {
            TestEvent(false, message);
        }
    }

    // ************************************** strings **************************************

    /// @dev Assert that the two strings A and B are equal.
    /// @param A The first string.
    /// @param B The second string.
    /// @param message The message to display if the assertion fails.
    function assertStringsEqual(string A, string B, string message) internal constant returns (bool result){
        result = _stringsEqual(A, B);
        report(result, message);
    }

    /// @dev Assert that the two strings A and B are not equal.
    /// @param A The first string.
    /// @param B The second string.
    /// @param message The message to display if the assertion fails.
    function assertStringsNotEqual(string A, string B, string message) internal constant returns (bool result) {
        result = !_stringsEqual(A, B);
        report(result, message);
    }

    /// @dev Assert that the string 'str' is empty.
    /// @param str the string.
    /// @param message The message to display if the assertion fails.
    function assertStringIsEmpty(string str, string message) internal constant returns (bool result){
        result = _stringsEqual(str, "");
        report(result, message);
    }

    /// @dev Assert that the string 'str' is not empty.
    /// @param str the string.
    /// @param message The message to display if the assertion fails.
    function assertStringIsNotEmpty(string str, string message) internal constant returns (bool result){
        result = !_stringsEqual(str, "");
        report(result, message);
    }

    // ************************************** bytes32 **************************************

    /// @dev Assert that the two bytes32 A and B are equal.
    /// @param A The first bytes(32).
    /// @param B The second bytes(32).
    /// @param message The message to display if the assertion fails.
    function assertBytes32Equal(bytes32 A, bytes32 B, string message) internal constant returns (bool result){
        result = (A == B);
        report(result, message);
    }

    /// @dev Assert that the two bytes32 A and B are not equal.
    /// @param A The first bytes(32).
    /// @param B The second bytes(32).
    /// @param message The message to display if the assertion fails.
    function assertBytes32NotEqual(bytes32 A, bytes32 B, string message) internal constant returns (bool result) {
        result = (A != B);
        report(result, message);
    }

    /// @dev Assert that the bytes32 'bts' is zero.
    /// @param bts the bytes(32).
    /// @param message The message to display if the assertion fails.
    function assertBytes32Zero(bytes32 bts, string message) internal constant returns (bool result){
        result = (bts == 0);
        report(result, message);
    }

    /// @dev Assert that the bytes32 'bts' is not zero.
    /// @param bts The bytes(32).
    /// @param message The message to display if the assertion fails.
    function assertBytes32NotZero(bytes32 bts, string message) internal constant returns (bool result){
        result = (bts != 0);
        report(result, message);
    }

    // ************************************** address **************************************

    /// @dev Assert that the two addresses A and B are equal.
    /// @param A The first address.
    /// @param B The second address.
    /// @param message The message to display if the assertion fails.
    function assertAddressesEqual(address A, address B, string message) internal constant returns (bool result){
        result = (A == B);
        report(result, message);
    }

    /// @dev Assert that the two addresses A and B are not equal.
    /// @param A The first address.
    /// @param B The second address.
    /// @param message The message to display if the assertion fails.
    function assertAddressesNotEqual(address A, address B, string message) internal constant returns (bool result) {
        result = (A != B);
        report(result, message);
    }

    /// @dev Assert that the address 'addr' is zero.
    /// @param addr The Address.
    /// @param message The message to display if the assertion fails.
    function assertAddressZero(address addr, string message) internal constant returns (bool result){
        result = (addr == 0);
        report(result, message);
    }

    /// @dev Assert that the address 'addr' is not zero.
    /// @param addr The Address.
    /// @param message The message to display if the assertion fails.
    function assertAddressNotZero(address addr, string message) internal constant returns (bool result){
        result = (addr != 0);
        report(result, message);
    }

    // ************************************** bool **************************************

    /// @dev Assert that the two booleans A and B are equal.
    /// @param A The first boolean.
    /// @param B The second boolean.
    /// @param message The message to display if the assertion fails.
    function assertBoolsEqual(bool A, bool B, string message) internal constant returns (bool result) {
        result = (A == B);
        report(result, message);
    }

    /// @dev Assert that the two booleans A and B are not equal.
    /// @param A The first boolean.
    /// @param B The second boolean.
    /// @param message The message to display if the assertion fails.
    function assertBoolsNotEqual(bool A, bool B, string message) internal constant returns (bool result) {
        result = (A != B);
        report(result, message);
    }

    /// @dev Assert that the boolean b is true.
    /// @param b The boolean.
    /// @param message The message to display if the assertion fails.
    function assertTrue(bool b, string message) internal constant returns (bool result) {
        result = b;
        report(result, message);
    }

    /// @dev Assert that the boolean b is false.
    /// @param b The boolean.
    /// @param message The message to display if the assertion fails.
    function assertFalse(bool b, string message) internal constant returns (bool result) {
        result = !b;
        report(result, message);
    }

    // ************************************** uint **************************************

    /// @dev Assert that the two uints (256) A and B are equal.
    /// @param A The first uint.
    /// @param B The second uint.
    /// @param message The message to display if the assertion fails.
    function assertUintsEqual(uint A, uint B, string message) internal constant returns (bool result) {
        result = (A == B);
        report(result, message);
    }



    /// @dev Assert that the two uints (256) A and B are not equal.
    /// @param A The first uint.
    /// @param B The second uint.
    /// @param message The message to display if the assertion fails.
    function assertUintsNotEqual(uint A, uint B, string message) internal constant returns (bool result) {
        result = (A != B);
        report(result, message);
    }

    /// @dev Assert that the uint (256) A is larger then B.
    /// @param A The first uint.
    /// @param B The second uint.
    /// @param message The message to display if the assertion fails.
    function assertUintLargerThen(uint A, uint B, string message) internal constant returns (bool result) {
        result = (A > B);
        report(result, message);
    }

    /// @dev Assert that the uint (256) A is larger then or equal to B.
    /// @param A The first uint.
    /// @param B The second uint.
    /// @param message The message to display if the assertion fails.
    function assertUintLargerThenOrEqual(uint A, uint B, string message) internal constant returns (bool result) {
        result = (A >= B);
        report(result, message);
    }

    /// @dev Assert that the uint (256) A is smaller then B.
    /// @param A The first uint.
    /// @param B The second uint.
    /// @param message The message to display if the assertion fails.
    function assertUintSmallerThen(uint A, uint B, string message) internal constant returns (bool result) {
        result = (A < B);
        report(result, message);
    }

    /// @dev Assert that the uint (256) A is smaller then or equal to B.
    /// @param A The first uint.
    /// @param B The second uint.
    /// @param message The message to display if the assertion fails.
    function assertUintSmallerThenOrEqual(uint A, uint B, string message) internal constant returns (bool result) {
        result = (A <= B);
        report(result, message);
    }

    /// @dev Assert that the uint (256) number is 0.
    /// @param number The uint to test.
    /// @param message The message to display if the assertion fails.
    function assertUintZero(uint number, string message) internal constant returns (bool result) {
        result = (number == 0);
        report(result, message);
    }

    /// @dev Assert that the uint (256) number is not 0.
    /// @param number The uint to test.
    /// @param message The message to display if the assertion fails.
    function assertUintNotZero(uint number, string message) internal constant returns (bool result) {
        result = (number != 0);
        report(result, message);
    }

    // ************************************** int **************************************

    /// @dev Assert that the two ints (256) A and B are equal.
    /// @param A The first int.
    /// @param B The second int.
    /// @param message The message to display if the assertion fails.
    function assertIntsEqual(int A, int B, string message) internal constant returns (bool result) {
        result = (A == B);
        report(result, message);
    }

    /// @dev Assert that the two ints (256) A and B are not equal.
    /// @param A The first int.
    /// @param B The second int.
    /// @param message The message to display if the assertion fails.
    function assertIntsNotEqual(int A, int B, string message) internal constant returns (bool result) {
        result = (A != B);
        report(result, message);
    }

    /// @dev Assert that the int (256) A is larger then B.
    /// @param A The first int.
    /// @param B The second int.
    /// @param message The message to display if the assertion fails.
    function assertIntLargerThen(int A, int B, string message) internal constant returns (bool result) {
        result = (A > B);
        report(result, message);
    }

    /// @dev Assert that the int (256) A is larger then or equal to B.
    /// @param A The first int.
    /// @param B The second int.
    /// @param message The message to display if the assertion fails.
    function assertIntLargerThenOrEqual(int A, int B, string message) internal constant returns (bool result) {
        result = (A >= B);
        report(result, message);
    }

    /// @dev Assert that the int (256) A is smaller then B.
    /// @param A The first int.
    /// @param B The second int.
    /// @param message The message to display if the assertion fails.
    function assertIntSmallerThen(int A, int B, string message) internal constant returns (bool result) {
        result = (A < B);
        report(result, message);
    }

    /// @dev Assert that the int (256) A is smaller then or equal to B.
    /// @param A The first int.
    /// @param B The second int.
    /// @param message The message to display if the assertion fails.
    function assertIntSmallerThenOrEqual(int A, int B, string message) internal constant returns (bool result) {
        result = (A <= B);
        report(result, message);
    }

    /// @dev Assert that the int (256) number is 0.
    /// @param number The int to test.
    /// @param message The message to display if the assertion fails.
    function assertIntZero(int number, string message) internal constant returns (bool result) {
        result = (number == 0);
        report(result, message);
    }

    /// @dev Assert that the int (256) number is not 0.
    /// @param number The int to test.
    /// @param message The message to display if the assertion fails.
    function assertIntNotZero(int number, string message) internal constant returns (bool result) {
        result = (number != 0);
        report(result, message);
    }

    /// @dev Does a byte-by-byte lexicographical comparison of two strings.
    /// @return a negative number if `_a` is smaller, zero if they are equal
    /// and a positive numbe if `_b` is smaller.
    function _compareStrings(string a, string b) returns (int) {
        bytes memory ba = bytes(a);
        bytes memory bb = bytes(b);
        uint minLength = ba.length;
        if (bb.length < minLength) minLength = bb.length;
        //@todo unroll the loop into increments of 32 and do full 32 byte comparisons
        for (uint i = 0; i < minLength; i ++)
            if (ba[i] < bb[i])
                return -1;
            else if (ba[i] > bb[i])
                return 1;
        if (ba.length < bb.length)
            return -1;
        else if (ba.length > bb.length)
            return 1;
        else
            return 0;
    }

    /// @dev Compares two strings and returns true iff they are equal.
    function _stringsEqual(string a, string b) internal returns (bool) {
        return _compareStrings(a, b) == 0;
    }

}