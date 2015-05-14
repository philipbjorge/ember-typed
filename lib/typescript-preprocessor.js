'use strict';
var ts = require('typescript');
var objectAssign = require('object-assign');
var Filter = require('broccoli-filter')


/** brocolli-part start **/
function TSCompiler(inputTree, options) {
    if (!(this instanceof TSCompiler)) {
        return new TSCompiler(inputTree, options);
    }

    Filter.call(this, inputTree, options)
    this.options = options || {};
}

TSCompiler.prototype = Object.create(Filter.prototype);
TSCompiler.prototype.constructor = TSCompiler;
TSCompiler.prototype.extensions = ['ts'];
TSCompiler.prototype.targetExtension = 'js';
TSCompiler.prototype.processString = function(source, srcFile) {
    console.log("srcFile: ", srcFile);
    console.log("\ninput:\n", source);
    var res = ts.transpile(source, this.options);
    res = res.replace(/this.__decorate \|\| /g, ""); //broccoli-es6modules does not like this
    console.log("\noutput: \n", res);
    return res;
}
/** brocolli-part end **/


function TypeScriptPreprocessor(options) {
  this.name = 'ember-cli-typescript';
  this.ext = 'ts';
  this.options = options || {};
}

TypeScriptPreprocessor.prototype.ext = 'ts';
TypeScriptPreprocessor.prototype.toTree = function(tree, inputPath, outputPath) {
    var options = {
        noEmitOnError: false,
        noImplicitAny: false,
        target: ts.ScriptTarget.ES6,
        module: undefined,
        outDir: outputPath
    };

    return TSCompiler(tree, options);
};

module.exports = TypeScriptPreprocessor;

