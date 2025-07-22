'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const customBuildConfig = {
    // Add options here
    autoImport: {
      webpack: {
        resolve: {
          fallback: {
            vm: false, // TODO: This config should come from the editor. Remove this once we update to v10+
          },
        },
      },
    },
    'ember-simple-auth': {
      useSessionSetupMethod: true,
    },
  };

  let app = new EmberApp(defaults, customBuildConfig);

  return app.toTree();
};
