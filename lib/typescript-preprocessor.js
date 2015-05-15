'use strict';
var ts = require('typescript');
var objectAssign = require('object-assign');
var fs = require('fs');
var path = require('path');
var Writer = require('broccoli-writer');
var walkSync = require('walk-sync');
var xtend = require('xtend');
var symlinkOrCopySync = require('symlink-or-copy').sync;
var mkdirp = require('mkdirp');

/** brocolli-part start **/
function TSCompiler(inputTree, options) {
    if (!(this instanceof TSCompiler)) {
        return new TSCompiler(inputTree, options);
    }

    this.inputTree = inputTree;
    this.options = options || {};
}

TSCompiler.prototype = Object.create(Writer.prototype);
TSCompiler.prototype.constructor = TSCompiler;
TSCompiler.prototype.write = function(readTree, destDir) {
    console.log("TS - Debug", destDir);
    var options = xtend({outDir: destDir}, this.options);
    
    return readTree(this.inputTree).then(function(srcDir) {
        var paths =  walkSync(srcDir);
        var other_files = paths
                            .filter(function(x) {
                                return !isTypeScript(x);
                            });
                            
        for(var i = 0; i < other_files.length; ++i) {
            if (other_files[i].slice(-1) === '/') {
                mkdirp.sync(path.resolve(destDir, other_files[i]));
            } else {
                symlinkOrCopySync(path.resolve(srcDir, other_files[i]), path.resolve(destDir, other_files[i]));
            }
        }
        
        var files = paths
                    .filter(isTypeScript);

        if (files.length > 0) {
            options.outDir = path.resolve(destDir, files[0].substring(0, files[0].indexOf('/'))); //<- puts files into right path.. Fixes #1
            
            var input_files = files.map(function(filepath) {
                return path.resolve(srcDir, filepath);
            });
        
            //https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
            var program = ts.createProgram(input_files, options);
            var emitResult = program.emit();
            
            var allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
            
            allDiagnostics.forEach(function (diagnostic) { 
                if (typeof diagnostic.file === 'undefined') {
                    throw ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');    
                }
                var tmp = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                var line = tmp.line;
                var character = tmp.character;
                var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                throw diagnostic.file.fileName.replace(srcDir, "") + "(" + (line + 1) + " ," + (character + 1) +": " + message
            });
                
            var exitCode = emitResult.emitSkipped ? 1 : 0;
            
            //Fix decorator problem
            //broccoli-es6modules does not like this
            for(var i = 0; i < files.length; ++i) {
                var fpath = path.resolve(destDir, files[i].replace(".ts", ".js"));
                var string = fs.readFileSync(fpath, { encoding: 'utf-8' });
                string = string.replace(/this.__decorate \|\| /g, "");
                fs.writeFileSync(fpath, string, { encoding: 'utf-8' });
            }
        }
    });
};

function endsWith(input, suffix) {
    return input.indexOf(suffix, input.length - suffix.length) !== -1;
};

function isTypeScript(filepath) {
    return !endsWith(filepath, '.d.ts') && endsWith(filepath, '.ts');
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
        noEmitOnError: true,
        noImplicitAny: false,
        target: ts.ScriptTarget.ES6,
        module: undefined,
        outDir: outputPath
    };

    return TSCompiler(tree, options);
};

module.exports = TypeScriptPreprocessor;
