import Model, { attr } from '@ember-data/model';

export default class FeedbackQuestionModel extends Model {
  @attr uri;
  @attr question;
  @attr('datetime') timestamp;
  @attr from;
  @attr to;
}
