import Model, { attr } from '@ember-data/model';

export default class FeedbackAnswerModel extends Model {
  @attr uri;
  @attr answer;
  @attr('datetime') timestamp;
  @attr from;
  @attr to;
}
