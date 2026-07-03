import Service, { inject as service } from '@ember/service';
import { STATUS_REPORT } from 'frontend-lpdc/models/notification-preference';
import { tracked } from '@glimmer/tracking';

export default class NotificationService extends Service {
  @service store;
  @service currentSession;
  @tracked notificationPreference = null;

  async isChoiceMade() {
    const preference = await this.getNotificationPreference();
    return (
      preference !== undefined ||
      localStorage.getItem('makeNotificationPreferenceLater') === 'true'
    );
  }

  async getNotificationPreference() {
    if (this.notificationPreference) {
      return this.notificationPreference;
    }

    if (!this.currentSession.user) return null;

    const preferences = await this.store.query('notification-preference', {
      'filter[gebruiker][:id:]': this.currentSession.user.id,
    });
    this.notificationPreference = preferences[0];
    return this.notificationPreference;
  }

  makeChoiceLater() {
    localStorage.setItem('makeNotificationPreferenceLater', 'true');
  }

  enableChoiceIfNotPreviouslyConfirmed() {
    localStorage.removeItem('makeNotificationPreferenceLater');
  }

  async updateNotificationPreference(
    wantsNotifications,
    emailAddress,
    actions,
    frequency,
    wantsStatusReports,
  ) {
    let preference = await this.currentSession.user.notificationPreference;
    if (!preference) {
      preference = this.store.createRecord('notification-preference', {
        gebruiker: this.currentSession.user,
      });
    } else {
      // clear out whatever rule-configs already exist before rebuilding
      preference.notificationRuleConfigs = [];
    }

    preference.notificationsEnabled = wantsNotifications;
    preference.emailAddress = emailAddress;
    await preference.save();
    if (wantsNotifications) {
      await this.createRuleConfigs(
        preference,
        actions,
        frequency,
        wantsStatusReports,
      );
      await preference.hasMany('notificationRuleConfigs').reload();
    }
    return preference;
  }

  async createRuleConfigs(preference, actions, frequency, wantsStatusReports) {
    const configs = actions.map((notificationRule) =>
      this.store.createRecord('notification-rule-config', {
        notificationRule,
        frequency,
        notificationPreference: preference,
      }),
    );

    if (wantsStatusReports) {
      configs.push(
        this.store.createRecord('notification-rule-config', {
          notificationRule: STATUS_REPORT,
          frequency: 'bi-annual', //TODO: figure out how we'll do this
          notificationPreference: preference,
        }),
      );
    }

    return Promise.all(configs.map((config) => config.save()));
  }
}
