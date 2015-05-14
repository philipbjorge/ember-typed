var getAppRoot = require('../../lib/utilities/get-app-root');

module.exports = {
  description: 'Generates a object.',
  locals: function(options) {
    return {
      appRoot: getAppRoot(options)
    };
  }
};
