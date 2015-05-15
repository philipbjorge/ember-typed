'use strict';
var ts = require('typescript');
var objectAssign = require('object-assign');
var Filter = require('broccoli-filter');
var Promise = require('rsvp').Promise;
var fs = require('fs');
var path = require('path');

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

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
TSCompiler.prototype.processFile = function (srcDir, destDir, relativePath) {  
  var absoluteInputPath = srcDir + '/' + relativePath;
  var absoluteOutputPath = destDir + '/' + this.getDestFilePath(relativePath);
  
  //generate empty file..
  fs.writeFileSync(absoluteOutputPath, '', { encoding: 'utf-8' });
  
  if (absoluteInputPath.endsWith('.d.ts')) {
      console.log("TS skip " + relativePath);
      //not the nicest solution..
      return;
  }
  
  console.log("TS " + relativePath);
       
  //https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
  this.options.outDir = destDir + '/' + relativePath.substring(0, relativePath.indexOf('/')); //<- puts files into right path.. Fixes #1
  var program = ts.createProgram([absoluteInputPath], this.options);
  var emitResult = program.emit();
  
  var allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
  
  allDiagnostics.forEach(function (diagnostic) { 
        var tmp = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        var line = tmp.line;
        var character = tmp.character;
        var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.warn(diagnostic.file.fileName.replace(srcDir, "") + "(" + (line + 1) + " ," + (character + 1) +": " + message);
  });
    
  var exitCode = emitResult.emitSkipped ? 1 : 0;
  
  //Fix decorator problem
  //broccoli-es6modules does not like this
  var string = fs.readFileSync(srcDir + '/' + relativePath, { encoding: 'utf-8' })
  string = string.replace(/this.__decorate \|\| /g, "");
};
/** brocolli-part end **/


function TypeScriptPreprocessor(options) {
  this.name = 'ember-cli-typescript';
  this.ext = 'ts';
  this.options = options || {};
}

TypeScriptPreprocessor.prototype.ext = 'ts';
TypeScriptPreprocessor.prototype.toTree = function(tree, inputPath, outputPath) {
    var options = {
        noEmitOnError: true,
        noImplicitAny: false,
        target: ts.ScriptTarget.ES6,
        module: undefined,
        outDir: outputPath
    };

    return TSCompiler(tree, options);
};

module.exports = TypeScriptPreprocessor;
