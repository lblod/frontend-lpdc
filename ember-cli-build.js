'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const customBuildConfig = {
    // Add options here
    'ember-simple-auth': {
      useSessionSetupMethod: true,
    },
    babel: {
      plugins: [
        require.resolve('ember-concurrency/async-arrow-task-transform'),
      ],
    },
  };

  let app = new EmberApp(defaults, customBuildConfig);

  return app.toTree();
};
