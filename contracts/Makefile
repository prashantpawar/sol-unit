CONTRACTS:=$(addprefix ./src/, assertions/Asserter.sol ArrayTest.sol Bank.sol BankTest.sol BasicTypesTest.sol DemoTest.sol CoinTest.sol IndirectionTest.sol StructsTest.sol WrapsInternalTest.sol)

all:
	solc --bin --abi -o ./build $(CONTRACTS)

clean:
	rm -rf ./build