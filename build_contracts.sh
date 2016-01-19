#!/bin/bash

# Will be simplified a lot when new solc imports are added.
CONTRACTS_DIR="./contracts"
BUILD_DIR=${CONTRACTS_DIR}/build
SRC_DIR=${CONTRACTS_DIR}/src
TEST_DIR=${CONTRACTS_DIR}/test

BUILD_RELEASE_DIR=${BUILD_DIR}/release
BUILD_TEST_DIR=${BUILD_DIR}/test
BUILD_DOCS_DIR=${BUILD_DIR}/docs

declare -a SrcContracts=('Asserter.sol')
declare -a TestContracts=('ArrayTest.sol' 'Bank.sol' 'BankTest.sol' 'BasicTypesTest.sol' 'CoinTest.sol' 'DemoTest.sol' 'GlobalsTest.sol' 'IndirectionTest.sol' 'StructsTest.sol' 'WrapsInternalTest.sol')

rm -rf ${BUILD_DIR}
mkdir -p ${BUILD_DIR}
mkdir -p ${BUILD_RELEASE_DIR}
mkdir -p ${BUILD_TEST_DIR}
mkdir -p ${BUILD_DOCS_DIR}

CONTRACTS="${SrcContracts[@]/#/${SRC_DIR}/}"
TEST_CONTRACTS="${TestContracts[@]/#/${TEST_DIR}/}"

solc --bin --abi -o ${BUILD_RELEASE_DIR} ${CONTRACTS}
solc --bin --abi -o ${BUILD_TEST_DIR} ${CONTRACTS} ${TEST_CONTRACTS}
solc --devdoc -o ${BUILD_DOCS_DIR} ${CONTRACTS}