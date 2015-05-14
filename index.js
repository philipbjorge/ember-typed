'use strict';
var checker   = require('ember-cli-version-checker');
var defaults  = require('lodash').defaults;

var TypeScriptPreprocessor = require('./lib/typescript-preprocessor');

module.exports = {
  name: 'Ember CLI Typed Addon',

  shouldSetupRegistryInIncluded: function() {
    return !checker.isAbove(this, '0.2.0');
  },

  getConfig: function() {
    var brocfileConfig = {};
    var typeScriptOptions = defaults(this.project.config(process.env.EMBER_ENV).typedOptions || {},
      brocfileConfig, {
        blueprints: true
      });

    return typeScriptOptions;
  },

  setupPreprocessorRegistry: function(type, registry) {
    var plugin = new TypeScriptPreprocessor(this.getConfig());

    registry.add('js', plugin);
  },
  
  included: function(app) {
    this.app = app;

    if (this.shouldSetupRegistryInIncluded()) {
      this.setupPreprocessorRegistry('parent', app.registry);
    }
  }
};
