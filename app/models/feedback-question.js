import Model, { attr, belongsTo } from '@ember-data/model';

export default class FeedbackQuestionModel extends Model {
  @attr uri;
  @attr question;
  @attr('datetime') timestamp;
  @belongsTo('concept', { async: false, inverse: null }) from;
  @belongsTo('concept', { async: false, inverse: null }) to;
}
