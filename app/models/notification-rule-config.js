import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class NotificationRuleConfigModel extends Model {
  @attr frequency;
  @attr notificationRule;

  @belongsTo('notification-preference', {
    async: true,
    inverse: 'notificationRuleConfigs',
  })
  notificationPreference;
}
