import Model, { attr, belongsTo } from '@ember-data/model';

export default class NotificationRuleConfigModel extends Model {
  @attr frequency;
  @attr notificationRule;

  @belongsTo('notification-preference', { async: true, inverse: null })
  notificationPreference;
}
