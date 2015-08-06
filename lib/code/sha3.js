var sha3 = require('crypto-js/sha3');

module.exports = function (str) {
    return sha3(str, {
        outputLength: 256
    }).toString().toUpperCase();
};