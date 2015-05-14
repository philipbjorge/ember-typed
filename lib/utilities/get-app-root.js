'use strict';

module.exports = function getAppRoot(options) {
  var name = options.entity.name;
  var nameParts = name.split('/');
  var depth = '.';

  return nameParts.reduce(function(prev) {
    return prev + '/..';
  }, depth);
};
