/**
 * @file tree_parsing.js
 * @fileOverview Various tools for working with AST files.
 * @author Andreas Olofsson (andreas@erisindustries.com)
 * @module tree_parsing
 */
'use strict';

var nUtil = require('util');

exports.Visitor = Visitor;
exports.RecordVisitor = RecordVisitor;

/**
 * Visitor class that is provided with a process method. It works on a tree where each node is data-only (they have
 * no methods). It does depth first traversal and will keep going as long as the 'process' method returns false,
 * meaning it can be used to traverse the entire tree or stop as soon as a certain condition is met.
 *
 * @param process
 * @constructor
 */
function Visitor(process){
    this._process = process;
}

Visitor.prototype.visit = function(node){
    if(this._process(node)){
        return node;
    }
    var children = node.children;
    if (!children) return null;
    for (var i = 0; i < children.length; i++) {
        var nd = this.visit(children[i]);
        if(nd) return nd;
    }
    return null;
};

/**
 * Visitor that works as the normal Visitor except it bumps a 'visited' entry each time a node is hit, making it
 * possible to see how many times a node has been visited.
 *
 * @param process
 * @constructor
 */
function RecordVisitor(process){
    var that = this;
    var logProcess = function(node){
        if(!node.visits){
            node.visits = 0;
        }
        node.visits++;
        process(node);
    };

    Visitor.call(this, logProcess);
}

nUtil.inherits(RecordVisitor, Visitor);