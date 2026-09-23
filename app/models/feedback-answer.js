import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class FeedbackAnswerModel extends Model {
  @attr uri;
  @attr answer;
  @attr('datetime') timestamp;
  @belongsTo('concept', { async: false, inverse: null }) from;
  @belongsTo('concept', { async: false, inverse: null }) to;
}
