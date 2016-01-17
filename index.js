/**
 * @file index.js
 * @fileOverview index file.
 * @author Andreas Olofsson (androlo1980@gmail.com)
 * @module index
 */
'use strict';

var SolUnit = require('./lib/sol_unit');
var presenter = require('./lib/log_presenter');

exports.runTests = function(tests, rootDir, logging, cb){

    var sUnit = new SolUnit();

    // Set the callbacks up.
    sUnit.on('suiteStarted', suiteStarted);
    sUnit.on('contractStarted', contractStarted);
    sUnit.on('methodsStarted', methodsStarted);
    sUnit.on('methodStarted', methodStarted);
    sUnit.on('methodDone', methodDone);
    sUnit.on('methodsDone', methodsDone);
    sUnit.on('contractDone', contractDone);
    sUnit.on('suiteDone', suiteDone);

    renderLogo();

    sUnit.start(tests, rootDir);

    function suiteStarted(error, tests) {
        if(error) throw new Error(error);
        if(logging) {
            presenter.presentSuiteStarted(error, tests);
        }
    }

    function contractStarted(error, name) {
        if(logging) {
            presenter.presentContractStarted(error, name);
        }
    }

    function methodsStarted(error, methods) {
        if(logging) {
            presenter.presentMethodsStarted(error, methods);
        }
    }

    function methodStarted(methodName) {
        if(logging) {
            presenter.presentMethodStarted(methodName);
        }
    }

    function methodDone(results) {
        if(logging) {
            presenter.presentMethodDone(results);
        }
    }

    function methodsDone(error, contractName, stats) {
        if(logging) {
            presenter.presentMethodsDone(error, contractName, stats);
        }
    }

    function contractDone(error, name) {
    }

    function suiteDone(stats) {
        if(logging) {
            presenter.presentSuiteDone(stats);
        }
        cb(stats);
    }
};

function renderLogo() {
    console.log(" ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ");
    console.log("|                      _   _         _  _                   |");
    console.log("|                     | | | |       (_)| |                  |");
    console.log("|                 ___ | | | | _ __   _ | |_                 |");
    console.log("|                / __|| | | || '_ \\ | || __|                |");
    console.log("|                \\__ \\| |_| || | | || || |_                 |");
    console.log("|                |___/ \\___/ |_| |_||_| \\__|                |");
    console.log("|                                                           |");
    console.log("|                    By: Andreas Olofsson                   |");
    console.log("|                e-mail: androlo1980@gmail.com              |");
    console.log("|                                                           |");
    console.log("*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*");
}