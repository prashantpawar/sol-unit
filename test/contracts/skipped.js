var solUnit = require('../../index');
var path = require('path');

var tests = ['LibTest', 'ImNotHere'];
var rootDir = path.join(__dirname, "../../contracts/build/test");

solUnit.runTests(tests, rootDir, true, function(stats){});