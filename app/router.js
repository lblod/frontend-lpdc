import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('login');
  this.route('mandatenbeheer', function(){
    this.route('mandatarissen', function(){
      this.route('new');
      this.route('new-person');
      this.route('edit', {path: '/:id/edit'});
    });

    this.route('personen', function() {});
    this.route('fracties', function() {});
  });

  this.route('bbcdr', function() {
    this.route('rapporten', function() {
      this.route('new');
      this.route('edit', { path: '/:id' });
    });
  });

  this.route('toezicht', function() {
    this.route('inzendingen', function() {
      this.route('new');
      this.route('edit', { path: '/:id' });
    });
  });
  this.route('contact');
  this.route('route-not-found', {
    path: '/*wildcard'
  });
  this.route('mock-login');

  this.route('legaal', function() {
    this.route('disclaimer');
    this.route('cookieverklaring');
  });
  this.route('berichtencentrum', function() {
    this.route('berichten', function() {
      this.route('conversatie', { path: ':id' }, function() {});
    });
  });
  this.route('leidinggevendenbeheer', function() {
    this.route('bestuursfuncties');
    this.route('functionarissen', { path: '/:id/functionarissen' }, function() {
      this.route('new', function() {
        this.route('select-persoon');
        this.route('provide-details');
        this.route('create-persoon');
      });
      this.route('edit', { path: '/:functionarisId/edit' });
    });
  });
});

export default Router;
