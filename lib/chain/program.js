var async = require('async');
var VM = require('ethereumjs-vm');
var Account = require('ethereumjs-account');
var Transaction = require('ethereumjs-tx');
var Trie = require('merkle-patricia-tree');
var rlp = require('rlp');
var utils = require('ethereumjs-util');


function Program(){
    this.nonce = 0;
}

Program.prototype.init = function(bin, abi, cb) {
    // creating a trie that just resides in memory
    this.stateTrie = new Trie();

    // create a new VM instance
    this.vm = new VM(this.stateTrie);

    this.secretKey = '3cd7232cd6f3fc66a57a6bedc1a8ed6c228fff0a327e169c2bcc5e869ed49511';
    this.publicKey = '0406cc661590d48ee972944b35ad13ff03c7876eae3fd191e8a2f77311b0a3c6613407b5005e63d7d8d76b89d5f900cde691497688bb281e07a5052ff61edebdc0';

    // the address we are sending from
    var address = utils.pubToAddress(new Buffer(this.publicKey, 'hex'));
    this.address = '0x' + address.toString('hex');

    // create a new account
    var account = new Account();

    // give the account some wei.
    // This needs to be a `Buffer` or a string. all strings need to be in hex.
    account.balance = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

    this.abi = abi;

    var that = this;
    // store in the trie
    this.stateTrie.put(this.address, account.serialize(), function(err){
        if (err) return cb(err);
        that.runTx({data: bin}, function(err2){
            if (err2) return cb(err2);
            cb();
        });
    });
};

// runs a transaction through the vm
Program.prototype.runTx = function(raw, cb) {

    raw.nonce = this.nextNonce();
    raw.from = this.address;
    raw.gasPrice = '0x01';
    raw.gasLimit = '0x3000000000';

    var tx = new Transaction(raw);
    // tx.from
    tx.sign(new Buffer(this.secretKey, 'hex'));

    // run the tx
    var that = this;
    this.vm.runTx({
        tx: tx
    }, function (err, results) {
        if(err) return cb(err);
        var newContract;
        if (results.createdAddress) {
            newContract = results.createdAddress.toString('hex');
            that.createdAddress = '0x' + newContract;
        }
        cb(err, results, newContract);
    })
};

Program.prototype.nextNonce = function(){

    var nonceStr = (this.nonce++).toString(16);
    if(nonceStr.length % 2 != 0){
        nonceStr = '0' + nonceStr;
    }
    return '0x' + nonceStr;
};

module.exports = Program;