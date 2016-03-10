var solUnit = require('../../index');
var path = require('path');

var tests = ['EthTest'];
var rootDir = path.join(__dirname, "../../contracts/build/test");

solUnit.runTests(tests, rootDir, true, function(stats){
    console.log("total number of failed tests: " + (stats.total - stats.successful).toString());
});