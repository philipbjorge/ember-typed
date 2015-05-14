var getAppRoot = require('../../lib/utilities/get-app-root');

module.exports = {
  description: 'Generates a controller.',
  locals: function(options) {
    return {
      appRoot: getAppRoot(options)
    };
  }
};
