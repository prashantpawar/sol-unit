import "../src/Test.sol";
import "./Bank.sol";

contract AccountOwner {

    Bank bank;

    function AccountOwner(address bankAddr){
        bank = Bank(bankAddr);
    }

    function endow(bytes32 to, uint amount) external returns (uint16 result){
        return bank.endow(to, amount, "...");
    }

    function registerNewAccount(bytes32 name) external returns (uint16 result) {
        return bank.registerNewAccount(name);
    }

    function deleteAccount(bytes32 name) external returns (uint16 result) {
        return bank.deleteAccount(name);
    }

    function transfer(bytes32 to, uint amount) external returns (uint16 result){
        return bank.transfer(to, amount, "...");
    }

}

/// @title BankTest
/// @author Andreas Olofsson (andreas@erisindustries.com)
// Note most of these tests does not count as towards coverage, since the transfer method
// is called via another account. Should add support for this in s-unit.
contract BankTest is Test {

    // Error codes from Bank.

    // General.
    uint8 constant SUCCESS = 0; // Success.
    // Account related.
    uint8 constant NO_ACCOUNT = 10; // Caller has no account.
    uint8 constant ACCOUNT_EXISTS = 11; // Caller already has an account.
    uint8 constant NO_TARGET = 12; // Recipient does not have an account.
    uint8 constant NOT_OWNER = 13; // Caller is not owner.
    // Balance related
    uint8 constant NO_AMOUNT = 20; // Transacted amount is 0.
    uint8 constant INSUFFICIENT_BALANCE = 21; // Insufficient balance.

    uint constant TEST_BALANCE = 1000;

    Bank testee;
    AccountOwner testReg;
    AccountOwner testRegFail;
    AccountOwner testDelete;
    AccountOwner testEndow;
    AccountOwner testEndowFailer;
    AccountOwner testTransferer;
    AccountOwner testTransferee;
    AccountOwner testTransfererBalanceCheck;
    AccountOwner testTransfereeBalanceCheck;
    AccountOwner testTransfererNoAccount;
    AccountOwner testTransfererNoAmount;
    AccountOwner testTransfererInsufficientBalance;
    AccountOwner testTransfererNoTarget;

    function BankTest(){
        testee = new Bank();
        testReg = new AccountOwner(testee);
        testRegFail = new AccountOwner(testee);
        testDelete = new AccountOwner(testee);
        testEndow = new AccountOwner(testee);
        testEndowFailer = new AccountOwner(testee);
        testTransferer = new AccountOwner(testee);
        testTransferee = new AccountOwner(testee);
        testTransfererBalanceCheck = new AccountOwner(testee);
        testTransfereeBalanceCheck = new AccountOwner(testee);
        testTransfererNoAccount = new AccountOwner(testee);
        testTransfererNoAmount = new AccountOwner(testee);
        testTransfererInsufficientBalance = new AccountOwner(testee);
        testTransfererNoTarget = new AccountOwner(testee);
    }

    function testOwnerSucceeding(){
        var owner = testee.owner();
        owner.assertEqual(address(this), "owner address does not match.");
    }

    function testGetMyAddress(){
        var myAddrs = testee.getMyAddress();
        myAddrs.assertEqual(address(this), "owner address does not match.");
    }

    function testRegisterAccount(){
        var ret = testReg.registerNewAccount("testReg");
        uint(ret).assertEqual(SUCCESS, "registration failed");
    }

    function testRegisterAccountFailAlreadyExists(){
        var ret = testRegFail.registerNewAccount("testReg");
        var ret2 = testRegFail.registerNewAccount("testReg");
        uint(ret2).assertEqual(ACCOUNT_EXISTS, "registration succeeded");
    }

    function testRegDeleteOwner(){
        testee.registerNewAccount("testOwnerAcc");
        var ret = testee.deleteAccount("testOwnerAcc");
        uint(ret).assertEqual(SUCCESS, "registrating owner failed");
    }

    function testDeleteAccount(){
        testDelete.registerNewAccount("testDelete");
        var ret = testDelete.deleteAccount("testDelete");
        uint(ret).assertEqual(SUCCESS, "registration failed");
    }

    function testEndowSucceeding(){
        testEndow.registerNewAccount("testEndow");
        var result = testee.endow("testEndow", TEST_BALANCE, "testmessage");
        uint(result).assertEqual(SUCCESS, "endow failed");
    }

    function testEndowFailNotOwner(){
        testEndowFailer.registerNewAccount("testEndowFailer");
        var result = testEndowFailer.endow("testEndowFailer", TEST_BALANCE);
        uint(result).assertEqual(NOT_OWNER, "endow succeeded");
    }

    function testEndowFailNoTarget(){
        var result = testee.endow("noAcc", TEST_BALANCE, "testmessage");
        uint(result).assertEqual(NO_TARGET, "endow succeeded");
    }

    function testTransferSuccess(){
        testTransferer.registerNewAccount("testTransferer");
        testTransferee.registerNewAccount("testTransferee");
        testee.endow("testTransferer", TEST_BALANCE, "testmessage");
        testTransferer.transfer("testTransferee", TEST_BALANCE);
        var balanceIn = testee.getBalance("testTransferee");
        balanceIn.assertEqual(TEST_BALANCE, "balances does not match");
    }

    function testTransferSenderBalanceCheck(){
        testTransfererBalanceCheck.registerNewAccount("testTransfererBalanceCheck");
        testTransfereeBalanceCheck.registerNewAccount("testTransfereeBalanceCheck");
        testee.endow("testTransfererBalanceCheck", TEST_BALANCE, "testmessage");
        testTransfererBalanceCheck.transfer("testTransfereeBalanceCheck", TEST_BALANCE / 2);
        var balanceIn = testee.getBalance("testTransfererBalanceCheck");
        balanceIn.assertEqual(TEST_BALANCE / 2, "balances does not match");
    }

    function testTransferFailedNoAccount(){
        var result = testTransfererNoAccount.transfer("noAcc", 1);
        uint(result).assertEqual(NO_ACCOUNT, "no account fail");
    }

    function testTransferFailedNoAmount(){
        testTransfererNoAmount.registerNewAccount("testTfrNoAmt");
        var result = testTransferer.transfer("noAcc", 0);
        uint(result).assertEqual(NO_AMOUNT, "no amount fail");
    }

    function testTransferFailedInsufficientBalance(){
        testTransfererInsufficientBalance.registerNewAccount("testTfrIsfBlnc");
        var result = testTransfererInsufficientBalance.transfer("noAcc", 1);
        uint(result).assertEqual(INSUFFICIENT_BALANCE, "insufficient balance fail");
    }

    function testTransferFailedNoTarget(){
        testTransfererNoTarget.registerNewAccount("tstTrsfrrNTrgt");
        testee.endow("tstTrsfrrNTrgt", TEST_BALANCE, "testmessage");
        var result = testTransfererNoTarget.transfer("noAcc", 1);
        uint(result).assertEqual(NO_TARGET, "no target fail");
    }

}