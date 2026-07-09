import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class NotificationPreferenceModel extends Model {
  @attr('boolean') notificationsEnabled;
  @attr emailAddress;

  @belongsTo('gebruiker', {
    async: true,
    inverse: 'notificationPreference',
  })
  gebruiker;

  @hasMany('notification-rule-config', {
    async: true,
    inverse: 'notificationPreference',
  })
  notificationRuleConfigs;

  @hasMany('public-service', {
    async: true,
    inverse: 'notificationPreferences',
  })
  instances;
}

export const NOTIFICATION_ACTIONS = {
  FEEDBACK:
    'http://lblod.data.gift/concepts/60cd1b30-fa29-4fd9-a618-2f8566153849',
  REVIEW_STATUS:
    'http://lblod.data.gift/concepts/83d7bade-9b45-4d28-9348-3edcdcf99edc',
  FORMAL_INFORMAL:
    'http://lblod.data.gift/concepts/906311f3-f9f0-4b02-80de-d339df39a4ad',
};

export const STATUS_REPORT =
  'http://lblod.data.gift/concepts/634522c3-f5bd-4f53-82d3-983b7cbbdb10';
