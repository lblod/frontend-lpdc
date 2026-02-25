import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import ConfirmFeedbackSubmitModal from './confirm-feedback-submit-modal';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import {
  FEEDBACK_STATUS,
  PROCESSING_STATUS,
} from 'frontend-lpdc/models/feedback';

export default class FeedbackComponent extends Component {
  @service modals;
  @service store;
  @service currentSession;

  @tracked organization = 'Gemeente Aalter';
  @tracked feedbackExpanded = true;

  @action
  toggleFeedback() {
    this.feedbackExpanded = !this.feedbackExpanded;
  }

  constructor() {
    super(...arguments);
  }

  sendAnswer = task(async () => {
    await this.modals.open(ConfirmFeedbackSubmitModal, {
      feedbackAccepted: this.isProcessingAccepted,
      submitHandler: async (value) => {
        const answer = await this.store.createRecord('feedback-answer', {
          answer: value,
          timestamp: new Date(),
          from: this.currentSession.group.uri, //using the logged in org here
          to: this.question.from,
        });
        await answer.save();

        const verwerkt = await this.findConcept(FEEDBACK_STATUS.VERWERKT);

        this.feedback.answer = answer;
        this.feedback.status = verwerkt;
        await this.feedback.save();
      },
    });
  });

  async findConcept(statusUri) {
    const status = await this.store.query('concept', {
      'filter[:uri:]': statusUri,
      page: { size: 1 },
    });
    return status.at(0);
  }

  @action
  async markAsDenied() {
    const busy = await this.findConcept(FEEDBACK_STATUS.BEZIG);
    const denied = await this.findConcept(PROCESSING_STATUS.GEWEIGERD);

    this.feedback.status = busy;
    this.feedback.processingStatus = denied;
    await this.feedback.save();
  }

  @action
  async markAsAccepted() {
    const busy = await this.findConcept(FEEDBACK_STATUS.BEZIG);
    const accepted = await this.findConcept(PROCESSING_STATUS.GEACCEPTEERD);

    this.feedback.status = busy;
    this.feedback.processingStatus = accepted;
    await this.feedback.save();
  }

  get feedback() {
    return this.args.feedback;
  }

  get createdAt() {
    return this.feedback.createdAt;
  }

  get question() {
    return this.feedback.question;
  }
  get answer() {
    return this.feedback.answer;
  }
  get indexNumber() {
    return this.args.index + 1;
  }

  get feedbackStatusLabel() {
    // If feedback is still getting processed, fetch and show the processingStatus (accepted/denied)
    if (this.isVerwerkt) {
      return this.feedback.processingStatus.label;
    } else {
      return this.feedback.status.label;
    }
  }

  // Button is shown when user has selected a processingStatus (accepted/denied) and feedback is not processed
  get showSendAnswerButton() {
    return !this.isVerwerkt && this.args.feedback.processingStatus?.uri;
  }

  get isVerwerkt() {
    return this.args.feedback.status?.uri === FEEDBACK_STATUS.VERWERKT;
  }

  get isProcessingAccepted() {
    return (
      this.args.feedback.processingStatus?.uri ===
      PROCESSING_STATUS.GEACCEPTEERD
    );
  }

  get isProcessingDenied() {
    return (
      this.args.feedback.processingStatus?.uri === PROCESSING_STATUS.GEWEIGERD
    );
  }
}
