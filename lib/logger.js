/**
 * @file logger.js
 * @fileOverview This module handles logging.
 * @author Andreas Olofsson (andreas@erisindustries.com)
 * @module logger
 */
'use strict';

var winston = require('winston');

var levels = {
    'silly' : true,
    'debug' : true,
    'verbose' : true,
    'info' : true,
    'warn' : true,
    'error' : true
};

var testConfig = {
    levels: {
        header: 0,
        info: 1,
        success: 2,
        moderate: 3,
        fail: 4
    },
    colors: {
        header: 'magenta',
        info: 'cyan',
        success: 'green',
        moderate: 'yellow',
        fail: 'red'
    }
};

var logger = newLogger();

var testLogger = newTestLogger();

/**
 * Get the current logging level.
 *
 * @returns {string}
 */
exports.consoleLevel = function (){
    return logger.transports.console.level;
};

/**
 * Set the global logging level.
 *
 * @param level The new logging level (silly/debug/verbose/info/warn/error). Level uses a string
 *              format ie 'silly' or "warn".
 * @param forceNotification Default notification is sent on 'logger.info'. If forceNotification is
 *          truthy, it will use the regular 'console.log' to notify that the log level has been
 *          changed.
 */
exports.setConsoleLevel = function(level, forceNotification){
    if(typeof level !== "string" || !levels[level]){
        logger.warn("Illegal logging level.");
        return;
    }
    if(forceNotification) {
        console.log('Setting logging level to: ' + level);
    } else {
        logger.info('Setting logging level to: ' + level);
    }
    logger.transports.console.level = level;
};

/**
 * Get the global logger instance.
 */
exports.globalLogger = function(){
    return logger;
};

/**
 * Get the global test logger instance.
 */
exports.testLogger = function(){
    return testLogger;
};

/**
 * Create a new logger with default properties.
 */
exports.newLogger = newLogger;

/**
 * Create a new test-logger with default properties.
 */
exports.newTestLogger = newTestLogger;

function newLogger(){
    return new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                level: 'warn',
                label: 'Application'
            })
        ],
        label: "Application"
    });
}

function newTestLogger(){
    return new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                colorize: 'all',
                level: 'header',
                label: ''
            })
        ],
        levels: testConfig.levels,
        colors: testConfig.colors
    });
}
