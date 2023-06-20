import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service router;
  @service session;

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    this.router.replaceWith('public-services');
  }
}
