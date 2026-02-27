import Model, { attr, belongsTo } from '@ember-data/model';

export default class FeedbackAnswerModel extends Model {
  @attr uri;
  @attr answer;
  @attr('datetime') timestamp;
  @belongsTo('concept', { async: false, inverse: null }) from;
  @belongsTo('concept', { async: false, inverse: null }) to;
}
