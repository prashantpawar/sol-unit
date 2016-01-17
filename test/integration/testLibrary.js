var solUnit = require('../../index');
var path = require('path');

var tests = ['ArrayTest', 'IndirectionTest'];
var rootDir = path.join(__dirname, "../../contracts/build/tests");

solUnit.runTests(tests, rootDir, true, function(stats){

    console.log("total number of failed tests: " + (stats.total - stats.successful).toString());
});