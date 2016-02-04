var logger = require('./logger');
var testLog = logger.testLogger();

exports.presentSuiteStarted = function (error, tests) {
    if (error) {
        console.log("Eris-db error, aborting: " + error.message);
        return;
    }
    testLog.info("Running tests for: ", tests.length === 1 ? tests[0] : tests);
};

exports.presentContractStarted = function (error, name) {
    console.log('');
    testLog.header("Starting: " + name);
    if (error)
        testLog.fail("Failed to start tests for '" + name + "': " + error.message);
    else {
        testLog.info("Deploying contract.");
    }
    console.log('');
};

exports.presentMethodsStarted = function (error, methods) {
    if (error) {
        testLog.fail("Failed to start tests. Error: " + error.message);
    }
};

exports.presentMethodStarted = function (methodName) {
    testLog.info("Running '" + methodName + "'");
};

exports.presentMethodDone = function (results) {
    var result = results.result;
    var ti = "'" + results.name + "' - ";
    if (result) {
        testLog.success(ti + "PASSED");
    } else {
        if (results.errors.length > 0) {
            testLog.fail(ti + "FAILED:");
            for (var j = 0; j < results.errors.length; j++) {
                testLog.fail("Error: " + (results.errors[j] || "(no message)"));
            }
        } else {
            testLog.fail(ti + "FAILED:");
            for (var j = 0; j < results.messages.length; j++) {
                testLog.fail("Error: " + (results.messages[j] || "(no message)"));
            }
        }
    }
};

exports.presentMethodsDone = function (error, contractName, stats) {
    var r = true;
    console.log("");
    testLog.info("Test results:");
    for (var o in stats) {
        // Shut linter up...
        if (stats.hasOwnProperty(o)) {
            var data = stats[o];
            r = r && data.result;
        }
    }
    if (r) {
        testLog.success("*** All tests PASSED ***\n")
    } else {
        testLog.fail("!!! Some tests FAILED !!!\n")
    }
};

exports.presentContractDone = function (error, name) {
    if (error) {
        testLog.fail("Failed to deploy contract for: " + name + ": " + error.message);
    }
};

exports.presentSuiteDone = function (stats) {

    var notRun = stats.numSkippedUnits;

    var total = stats.total;
    var successful = stats.successful;
    var failed = total - successful;
    console.log("");
    if(total === 0){
        testLog.moderate("No tests were run.");
    } else {
        var logFunc;

        if (notRun)
            logFunc = testLog.moderate;
        else
            logFunc = testLog.success;

        if (failed === 0) {
            logFunc("Results: " + successful + " tests out " + total + " succeeded.");
        } else {
            testLog.fail("Results: " + successful + " tests out " + total + " succeeded.");
        }
    }

    if(notRun){
        console.log("");
        testLog.info("Some test contracts had to be skipped due to ERRORS:");
        for(var s in stats.skippedUnits){
            if(stats.skippedUnits.hasOwnProperty(s)){
                testLog.fail("'" + s + "': " + stats.skippedUnits[s]);
            }
        }
    }

};