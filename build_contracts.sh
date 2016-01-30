#!/bin/bash

CONTRACTS_DIR="./contracts"
BUILD_DIR=${CONTRACTS_DIR}/build
SRC_DIR=${CONTRACTS_DIR}/src
TEST_DIR=${CONTRACTS_DIR}/test

BUILD_TEST_DIR=${BUILD_DIR}/test

declare -a SrcContracts=('Asserter.sol')
declare -a TestContracts=('ArrayTest.sol' 'Bank.sol' 'BankTest.sol' 'BasicTypesTest.sol' 'CoinTest.sol' 'DemoTest.sol' 'LibTest.sol' 'GlobalsTest.sol' 'IndirectionTest.sol' 'StructsTest.sol' 'WrapsInternalTest.sol')

rm -rf ${BUILD_DIR}
mkdir -p ${BUILD_DIR}
mkdir -p ${BUILD_TEST_DIR}

CONTRACTS="${SrcContracts[@]/#/${SRC_DIR}/}"
TEST_CONTRACTS="${TestContracts[@]/#/${TEST_DIR}/}"

solc --bin --abi -o ${BUILD_TEST_DIR} ${CONTRACTS} ${TEST_CONTRACTS}