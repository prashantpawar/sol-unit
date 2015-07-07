var assert = require('assert');
var parsing = require('../lib/tree_parsing');
var ast = require('./testdata/BasicTypesTest.json');

describe('visitor', function () {

    it("Should find 190 nodes'", function () {
        var nodes = 0;
        var counter = function () {
            nodes++;
        };
        var visitor = new parsing.Visitor(counter);
        visitor.visit(ast);
        assert.strictEqual(nodes, 190, "Logger not set to 'error' level.");
    });

    it("Should find 11 'Function' nodes", function () {
        var nodes = 0;
        var counter = function (node) {
            if(node.name === "Function") {
                nodes++;
            }
        };
        var visitor = new parsing.Visitor(counter);
        visitor.visit(ast);
        assert.strictEqual(nodes, 11, "Logger not set to 'error' level.");
    });

    it("Should find 4 'Function' nodes where the function names begin with 'set'", function () {
        var nodes = 0;
        var counter = function (node) {
            if(node.name === "Function" && node.attributes.name.indexOf('set') === 0) {
                nodes++;
            }
        };
        var visitor = new parsing.Visitor(counter);
        visitor.visit(ast);
        assert.strictEqual(nodes, 4, "Logger not set to 'error' level.");
    });

});