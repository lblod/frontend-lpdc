import EmberRouter from '@ember/routing/router';
import config from 'frontend-lpdc/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('login');
  this.route('switch-login');
  this.route('mock-login');

  this.route('auth', { path: '/authorization' }, function () {
    this.route('callback');
    this.route('login');
    this.route('logout');
    this.route('switch');
  });

  this.route(
    'public-services',
    { path: '/producten-en-dienstencatalogus' },
    function () {
      this.route('add', { path: '/toevoegen' });
      this.route('new', { path: '/nieuw' });
      this.route('details', { path: '/:serviceId' }, function () {
        this.route('content', { path: '/inhoud' });
        this.route('properties', { path: '/eigenschappen' });
      });
      this.route('link-concept', { path: '/:serviceId/koppelen' }, function () {
        this.route('link', { path: '/:conceptId' });
      });
      this.route(
        'concept-details',
        { path: '/concept/:conceptId' },
        function () {
          this.route('content', { path: '/inhoud' });
          this.route('properties', { path: '/eigenschappen' });
        }
      );
    }
  );

  this.route('legaal', function () {
    this.route('disclaimer');
    this.route('cookieverklaring');
    this.route('toegankelijkheidsverklaring');
  });

  this.route('route-not-found', {
    path: '/*wildcard',
  });
});
