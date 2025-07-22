import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ENV from 'frontend-lpdc/config/environment';
import 'moment';
import 'moment-timezone';
import { action } from '@ember/object';
import { warn } from '@ember/debug';

export default class ApplicationRoute extends Route {
  @service intl;
  @service moment;
  @service session;
  @service currentSession;
  @service plausible;
  @service toaster;

  async beforeModel() {
    await this.session.setup();

    // ember-intl defaults to en-US and ember-rdfa-editor uses translations internally
    this.intl.setLocale(['nl-BE']);

    const moment = this.moment;
    moment.setLocale('nl-be');
    moment.setTimeZone('Europe/Brussels');
    moment.set('defaultFormat', 'DD MMM YYYY, HH:mm');

    this.startAnalytics();

    return this._loadCurrentSession();
  }

  startAnalytics() {
    let { domain, apiHost } = ENV.plausible;

    if (
      domain !== '{{ANALYTICS_APP_DOMAIN}}' &&
      apiHost !== '{{ANALYTICS_API_HOST}}'
    ) {
      this.plausible.enable({
        domain,
        apiHost,
      });
    }
  }

  @action
  error(error) {
    console.error(error);
    this.toaster.error(
      'Er is een serverfout opgetreden. Probeer het later opnieuw of neem contact op indien het probleem aanhoudt. Onze excuses voor het ongemak.',
      'Fout',
      { timeOut: 30000 }
    );
  }

  async _loadCurrentSession() {
    try {
      await this.currentSession.load();
    } catch (error) {
      warn(error, { id: 'current-session-load-failure' });
      this.router.transitionTo('auth.logout');
    }
  }
}
