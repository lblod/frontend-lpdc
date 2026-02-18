import Model, { attr, belongsTo } from '@ember-data/model';

export default class FeedbackSnapshotModel extends Model {
  @attr uri;
  @attr('datetime') createdAt;
  @belongsTo('feedback', { async: false, inverse: null }) feedback;
  @belongsTo('feedback', { async: false, inverse: null }) isVersionOf;
}
