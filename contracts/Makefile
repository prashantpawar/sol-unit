CONTRACTS=$(addprefix ./src/, Asserter.sol)
TEST_CONTRACTS=$(addprefix ./test/, ArrayTest.sol Bank.sol BankTest.sol BasicTypesTest.sol CoinTest.sol DemoTest.sol GlobalsTest.sol IndirectionTest.sol StructsTest.sol WrapsInternalTest.sol)


all: release tests docs

release:
	solc --bin --abi -o ./build/release $(CONTRACTS)

tests:
	solc --bin --abi -o ./build/tests $(CONTRACTS) $(TEST_CONTRACTS)

docs:
	solc --devdocs -o ./build/docs $(CONTRACTS)

clean:
	rm -rf ./build