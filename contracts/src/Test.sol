import "./Assertions.sol";

/*
    Contract: Test

    Contract that binds all valid types to the <Assertions> methods.

    Author: Andreas Olofsson (androlo1980@gmail.com)
*/
contract Test {
    using Assertions for bool;
    using Assertions for bytes32;
    using Assertions for string;
    using Assertions for address;
    using Assertions for int;
    using Assertions for uint;
    using Assertions for uint16;
}