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
var fs = require('fs-extra');
var path = require('path');


var DEFAULT_GAS_LIMIT = '0x3000000000';
var DEFAULT_GAS_PRICE = '0x01';
var DEFAULT_SECRET_KEY = '3cd7232cd6f3fc66a57a6bedc1a8ed6c228fff0a327e169c2bcc5e869ed49511';
var DEFAULT_PUBLIC_KEY = '0406cc661590d48ee972944b35ad13ff03c7876eae3fd191e8a2f77311b0a3c6613407b5005e63d7d8d76b89d5f900cde691497688bb281e07a5052ff61edebdc0';

function Program(testDir, testContractBalance) {
    this.nonce = 0;
    this.testContractBalance = testContractBalance;
    this.testDir = testDir;
    this.libs = {};
}

Program.prototype.init = function (bin, cb) {
    // console.log("Initializing test program.");
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
    var that = this;
    // store in the trie
    this.stateTrie.put(this.address, account.serialize(), function (err) {
        if (err) return cb(err);
        that.linkBytecode(bin, function (err, newBin) {
            that.runTx({data: newBin, value: that.testContractBalance || "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"}, function (err2, results) {
                if (err2) return cb(err2);
                var newContract = results.createdAddress.toString('hex');
                that.createdAddress = '0x' + newContract;
                cb();
            });
        })
    });
};

// runs a transaction through the vm
Program.prototype.runTx = function (raw, cb) {

    raw.nonce = this.nextNonce();
    raw.from = this.address;
    raw.gasPrice = DEFAULT_GAS_PRICE;
    raw.gasLimit = DEFAULT_GAS_LIMIT;

    var tx = new Transaction(raw);
    // tx.from
    tx.sign(new Buffer(this.secretKey, 'hex'));

    var testBlock = getNewBlock();

    this.vm.runTx({
        tx: tx,
        block: testBlock
    }, function (err, results) {
        cb(err, results);
    })
};

Program.prototype.nextNonce = function () {

    var nonceStr = (this.nonce++).toString(16);
    // TODO Will it start weirding out with buffers otherwise?
    if (nonceStr.length % 2 != 0) {
        nonceStr = '0' + nonceStr;
    }
    return '0x' + nonceStr;
};

function getNewBlock() {
    var block = new Block();
    var date = (Date.now() / 1000 | 0).toString(16);
    block.header.timestamp = new Buffer(date, 'hex');
    return block;
}

Program.prototype.linkBytecode = function (bin, cb) {
    if (bin.indexOf('_') < 0) {
        // console.log("No libraries found");
        return cb(null, bin);
    }
    var m = bin.match(/__([^_]{1,36})__/);
    // console.log("Found library: ");
    // console.log(m);
    if (!m)
        return cb("Invalid bytecode format.");
    var libraryName = m[1];
    if (!this.libs[libraryName]) {
        // console.log("Library '" + libraryName + "' not in list.");
        var libPath = path.join(this.testDir, libraryName + ".bin");

        try {
            var libBin = '0x' + fs.readFileSync(libPath).toString();
            // console.log("library loaded: " + libBin);
            this.libs[libraryName] = {bin: libBin};
            // console.log(this.libs);
        } catch (err) {
            return cb("Library " + libraryName + " not found in test-dir.");
        }
    }
    var that = this;
    this.deployLibrary(libraryName, function (err, address) {
        if (err) return cb(err);

        var libLabel = '__' + libraryName + new Array(39 - libraryName.length).join('_');
        // console.log('libLabel: ' + libLabel);
        var hexAddress = address.toString('hex');
        // console.log("hexAddress: " + hexAddress);
        if (hexAddress.slice(0, 2) == '0x') hexAddress = hexAddress.slice(2);
        hexAddress = new Array(40 - hexAddress.length + 1).join('0') + hexAddress;
        // console.log("hexAddress after modification: " + hexAddress);
        while (bin.indexOf(libLabel) >= 0) {
            // console.log("Replacing instance of library: " + libraryName);
            bin = bin.replace(libLabel, hexAddress);
        }
        // console.log("Binary code edited. New version: " + bin);
        that.linkBytecode(bin, cb);
    });
};

Program.prototype.deployLibrary = function (name, cb) {
    // console.log("Deploying library: " + name);
    if (this.libs[name].address) {
        // console.log("Library '" + name + "' already deployed at: " + this.libs[name].address.toString('hex'));
        return cb(null, this.libs[name].address);
    }
    var bin = this.libs[name].bin;
    // console.log("Library bin being deployed: " + bin);
    var that = this;
    if (bin.indexOf('_') >= 0) {
        // console.log("Library inside library detected: " + name);
        this.linkBytecode(bin, function (err, newBin) {
            // console.log("Library bin pre: " + bin);
            // console.log("Library bin post: " + newBin);
            if (err)
                return cb(err);
            that.libs[name].bin = newBin;
            that.deployLibrary(name, cb);
        });
    }
    else {
        this.runTx({data: bin}, function (err, result) {
            if (err) return cb(err);
            that.libs[name].address = result.createdAddress;
            // console.log("Library '" + name + "' was deployed at: " + that.libs[name].address.toString('hex'));
            cb(err, result.createdAddress);
        });
    }
};

module.exports = Program;