var assert = require('assert');
var logger = require('../lib/logger.js');

var log = logger.globalLogger();
var testLog = logger.testLogger();

describe('logger',function(){

    describe('#setConsoleLevel',function(){
        it("Should set the log level to 'error'", function(){
            logger.setConsoleLevel('error', true);
            log.info("Hahaa");
            assert.strictEqual(logger.consoleLevel(), 'error', "Logger not set to 'error' level.");
        });
        it("Should set the log level to 'info'", function(){
            logger.setConsoleLevel('info', true);
            assert.strictEqual(logger.consoleLevel(), 'info', "Logger not set to 'error' level.");
        });
    });

    describe('#log.info()',function(){
        logger.setConsoleLevel('info');
        var message;
        log.on('logging', function (transport, level, msg, meta) {
            message = msg;
        });
        it("Should print the correct string", function(done){
            log.info("Hahaa, %s!", 'logger');
            assert.strictEqual(message, "Hahaa, logger!", "Logger not printing the correct message.");
            done();
        });
    });

    describe('#testLog.info()',function(){
        var message;
        testLog.on('logging', function (transport, level, msg, meta) {
            message = msg;
        });
        it("Should print the correct string", function(done){
            testLog.info("Hahaa, %s!", 'test-logger');
            assert.strictEqual(message, "Hahaa, test-logger!", "Logger not printing the correct message.");
            done();
        });
    });

});