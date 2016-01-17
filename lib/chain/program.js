/**
 * @file program.js
 * @fileOverview Used to run contracts.
 * @author Andreas Olofsson (androlo1980@gmail.com)
 * @module program
 */
'use strict';

var async = require('async');
var VM = require('ethereumjs-vm');
var Block = require('ethereumjs-block');
var Account = require('ethereumjs-account');
var Transaction = require('ethereumjs-tx');
var Trie = require('merkle-patricia-tree');
var rlp = require('rlp');
var utils = require('ethereumjs-util');

var DEFAULT_GAS_LIMIT = '0x3000000000';
var DEFAULT_GAS_PRICE = '0x01';
var DEFAULT_SECRET_KEY = '3cd7232cd6f3fc66a57a6bedc1a8ed6c228fff0a327e169c2bcc5e869ed49511';
var DEFAULT_PUBLIC_KEY = '0406cc661590d48ee972944b35ad13ff03c7876eae3fd191e8a2f77311b0a3c6613407b5005e63d7d8d76b89d5f900cde691497688bb281e07a5052ff61edebdc0';

var testBlock = new Block();
var date = (Date.now() / 1000 | 0).toString(16);
testBlock.header.timestamp = new Buffer(date, 'hex');

function Program(){
    this.nonce = 0;
}

Program.prototype.init = function(bin, abi, cb) {
    // creating a trie that just resides in memory
    this.stateTrie = new Trie();

    // create a new VM instance
    this.vm = new VM(this.stateTrie);

    this.secretKey = DEFAULT_SECRET_KEY;
    this.publicKey = DEFAULT_PUBLIC_KEY;

    // the address we are sending from
    var address = utils.pubToAddress(new Buffer(this.publicKey, 'hex'));
    this.address = '0x' + address.toString('hex');

    // create a new account
    var account = new Account();

    // give the account some wei.
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
    raw.gasPrice = DEFAULT_GAS_PRICE;
    raw.gasLimit = DEFAULT_GAS_LIMIT;

    var tx = new Transaction(raw);
    // tx.from
    tx.sign(new Buffer(this.secretKey, 'hex'));

    // run the tx
    var that = this;
    this.vm.runTx({
        tx: tx,
        block: testBlock
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
    // TODO Will it start weirding out with buffers otherwise?
    if(nonceStr.length % 2 != 0){
        nonceStr = '0' + nonceStr;
    }
    return '0x' + nonceStr;
};

module.exports = Program;