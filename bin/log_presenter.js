var logger = require('../lib/logger');
var testLog = logger.testLogger();

exports.presentSuiteStarted = function (tests) {
    testLog.info("Running tests for: ", tests.length === 1 ? tests[0] : tests);
};

exports.presentContractStarted = function (error, name) {
    if (error) {
        testLog.fail("Failed to start tests for " + name + ": " + error.message);
    }
    console.log('');
    testLog.header("Starting: " + name);
    testLog.info("Deploying contract. This normally takes between 10 and 20 seconds.");
};

exports.presentMethodsStarted = function (error, methods) {
    if (error) {
        testLog.fail("Failed to start tests. Error: " + error.message);
    }
    for (var i = 0; i < methods.length; i++) {
        testLog.info("Running '" + methods[i].name + "' (" + (i + 1).toString() + " of " + methods.length + ")");
    }
    console.log('');
    testLog.info("Waiting for transactions to be committed...");
};

exports.presentMethodsDone = function (error, contractName, stats) {
    var r = true;
    console.log("");
    testLog.info("Test results:");
    var testResults = stats.testResults;
    var results = {successful: 0, total: testResults.length};
    for (var i = 0; i < testResults.length; i++) {
        var testResult = testResults[i];
        var result = testResult.result;
        var ti = "'" + testResult.name + "' - ";
        if (result) {
            results.successful++;
            testLog.success(ti + "PASSED");
        } else {
            if (testResult.error) {
                testLog.fail(ti + "FAILED: " + testResult.error);
            } else {
                testLog.fail(ti + "FAILED: " + testResult.message || "(no message)");
            }
        }
        r = r && testResult;
    }
    if (r) {
        testLog.success("*** All tests PASSED ***\n")
    } else {
        testLog.fail("!!! Some tests FAILED !!!\n")
    }
    if (stats.coverageResults) {
        presentCoverage(stats.coverageResults);
    }
};

exports.presentContractDone = function (error, name) {
    if (error) {
        testLog.fail("Failed to deploy contract for: " + name + ": " + error.message);
    }
};

exports.presentSuiteDone = function (successful, total) {
    var failed = total - successful;
    console.log("");
    if (failed === 0) {
        testLog.success("Results: " + successful + " tests out " + total + " succeeded.");
    } else {
        testLog.fail("Results: " + successful + " tests out " + total + " succeeded.");
    }
};

function presentCoverage(coverage) {
    var covered = 0;
    for (var i = 0; i < coverage.length; i++) {
        covered += coverage[i].covered ? 1 : 0;
    }
    // Percentage.
    var p = (covered / coverage.length)*100;

    testLog.info("Coverage report:");
    if (p < 55) {
        testLog.fail("Coverage: %d %", p.toFixed(2));
    } else if (p < 90) {
        testLog.moderate("Coverage: %d %", p.toFixed(2));
    } else {
        testLog.success("Coverage: %d %", p.toFixed(2));
    }
    testLog.info("Covered methods:");
    for (i = 0; i < coverage.length; i++) {
        var f = coverage[i];
        var tested = f.covered;
        if (tested) {
            testLog.success("%s", f.func);
        } else {
            testLog.fail("%s", f.func);
        }
    }
}