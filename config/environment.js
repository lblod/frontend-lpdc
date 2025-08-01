'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'frontend-lpdc',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: {
      EXTEND_PROTOTYPES: false,
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    moment: {
      allowEmpty: true,
      includeLocales: ['nl-be'],
      includeTimezone: 'all',
    },
    acmidm: {
      clientId: '{{ACMIDM_CLIENT_ID}}',
      scope: '{{ACMIDM_SCOPE}}',
      authUrl: '{{ACMIDM_AUTH_URL}}',
      logoutUrl: '{{ACMIDM_LOGOUT_URL}}',
      authRedirectUrl: '{{ACMIDM_AUTH_REDIRECT_URL}}',
      switchRedirectUrl: '{{ACMIDM_SWITCH_REDIRECT_URL}}',
    },
    adminRole: '{{ADMIN_ROLE}}',
    features: {
      // 'feature-name': '{{FEATURE_ENV_VAR_NAME}}',
      fusies: '{{FUSIES}}',
    },
    'ember-plausible': {
      enabled: false,
    },
    plausible: {
      domain: '{{ANALYTICS_APP_DOMAIN}}',
      apiHost: '{{ANALYTICS_API_HOST}}',
    },
    sentry: {
      dsn: '{{SENTRY_DSN}}',
      environment: '{{SENTRY_ENVIRONMENT}}',
    },
    '@sentry/ember': {
      // Performance tracking isn't super useful for us yet and it sends a lot of data to the backend (which counts against the free tier limit).
      // It also prevents the performance instrumentation code from running when Sentry isn't enabled (which is something that ideally is fixed in the addon itself).
      disablePerformance: true,
    },
    'ember-simple-auth': {
      routeAfterAuthentication: 'public-services',
    },
    loketUrl: '{{LOKET_URL}}',
    ipdcUrl: '{{IPDC_URL}}',
  };

  if (environment === 'development') {
    ENV.ipdcUrl = 'http://localhost:33000';
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
