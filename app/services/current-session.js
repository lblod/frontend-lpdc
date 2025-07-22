import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { setContext, setUser } from '@sentry/ember';
import { SHOULD_ENABLE_SENTRY } from 'frontend-lpdc/utils/sentry';
import ENV from 'frontend-lpdc/config/environment';

export default class CurrentSessionService extends Service {
  @service session;
  @service store;
  @service impersonation;

  @tracked account;
  @tracked user;
  @tracked group;
  @tracked groupClassification;
  @tracked roles = [];
  isLoaded = false;

  async load() {
    if (this.session.isAuthenticated && !this.isLoaded) {
      await this.impersonation.load();
      let accountId =
        this.session.data.authenticated.relationships.account.data.id;
      this.account = await this.store.findRecord('account', accountId, {
        include: 'gebruiker',
      });

      this.user = await this.account.gebruiker;
      this.roles = this.session.data.authenticated.data.attributes.roles;

      let groupId = this.session.data.authenticated.relationships.group.data.id;
      this.group = await this.store.findRecord('bestuurseenheid', groupId, {
        include: 'classificatie',
      });
      this.groupClassification = await this.group.classificatie;

      this.setupSentrySession();
      this.isLoaded = true;
    }
  }

  setupSentrySession() {
    if (SHOULD_ENABLE_SENTRY) {
      setUser({ id: this.user.id, ip_address: null });
      setContext('session', {
        account: this.account.id,
        user: this.user.id,
        group: this.group.uri,
        groupClassification: this.groupClassification.uri,
        roles: this.roles,
      });
    }
  }

  get isAdmin() {
    let roles = this.roles;
    if (this.impersonation.isImpersonating) {
      roles = this.impersonation.originalRoles || [];
    }
    return roles.includes(ENV.adminRole);
  }
}
