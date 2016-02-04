var assert = require('assert');
var SUnit = require('../lib/sol_unit');

describe('sol_unit', function () {

    it("should run an empty test suite successfully", function (done) {
        var sUnit = new SUnit();

        sUnit.on('suiteDone', function (stats) {
            assert.deepEqual(stats, {testUnits: {}, skippedUnits: {}, successful: 0, total: 0, numTestUnits: 0, numSkippedUnits: 0}, "Stats are wrong.");
            done();
        });

        sUnit.start([], "");
    });

    it("should fail because a file was not found", function (done) {
        var sUnit = new SUnit();

        sUnit.on('contractStarted', function (error, name) {
            assert.strictEqual(error.message, "ENOENT: no such file or directory, open 'xxx.bin'", "Wrong error");
            assert.strictEqual(name, "xxx", "Wrong name of failing contract: " + name);
        });

        sUnit.on('suiteDone', function (stats) {
            assert.deepEqual(stats, { testUnits: {},
                    skippedUnits: { xxx: 'ENOENT: no such file or directory, open \'xxx.bin\'' },
                    successful: 0,
                    total: 0,
                    numTestUnits: 1,
                    numSkippedUnits: 1 }
                , "Wrong stats returned.");
            done();
        });

        sUnit.start(['xxx'], "");

    });

});