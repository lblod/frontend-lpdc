import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import ConfirmFeedbackSubmitModal from './confirm-feedback-submit-modal';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import {
  FEEDBACK_STATUS,
  PROCESSING_STATUS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_PROCESSING_STATUS_LABELS,
} from 'frontend-lpdc/models/feedback';

export default class FeedbackComponent extends Component {
  @service modals;
  @service store;
  @service currentSession;
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
          from: this.question.to,
          to: this.question.from,
        });
        await answer.save();

        const verwerkt = FEEDBACK_STATUS.VERWERKT;

        this.feedback.answer = answer;
        this.feedback.status = verwerkt;
        await this.feedback.save();
      },
    });
  });

  @action
  async markAsDenied() {
    const busy = FEEDBACK_STATUS.BEZIG;
    const denied = PROCESSING_STATUS.GEWEIGERD;

    this.feedback.status = busy;
    this.feedback.processingStatus = denied;
    await this.feedback.save();
  }

  @action
  async markAsAccepted() {
    const busy = await FEEDBACK_STATUS.BEZIG;
    const accepted = await PROCESSING_STATUS.GEACCEPTEERD;

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
    if (this.isVerwerkt || this.isVerzonden) {
      // TODO: check if ok/needed
      // if no processingStatus is known but it's processed, show as 'Verwerkt'
      if (this.feedback.processingStatus === undefined)
        return FEEDBACK_STATUS_LABELS[this.feedback.status];

      return FEEDBACK_PROCESSING_STATUS_LABELS[this.feedback.processingStatus];
    } else {
      return FEEDBACK_STATUS_LABELS[this.feedback.status];
    }
  }

  get questionSenderLabel() {
    const questionSender = this.question.from;
    return `${questionSender.label}`;
  }

  get answerSenderLabel() {
    const answerSender = this.answer.from;
    const isBestuurseenheid =
      answerSender.uri &&
      answerSender.uri.includes('data.lblod.info/id/bestuurseenheden/');

    if (isBestuurseenheid) {
      return `${this.currentSession.group.classificatie.label} ${this.currentSession.group.naam}`;
    } else {
      return `${answerSender.label}`;
    }
  }

  // Button is shown when user has selected a processingStatus (accepted/denied) and feedback is not processed
  get showSendAnswerButton() {
    return !this.isVerwerkt && this.args.feedback.processingStatus;
  }

  get isVerwerkt() {
    return this.args.feedback.status === FEEDBACK_STATUS.VERWERKT;
  }
  get isVerzonden() {
    return this.args.feedback.status === FEEDBACK_STATUS.VERZONDEN;
  }

  get isProcessingAccepted() {
    return (
      this.args.feedback.processingStatus === PROCESSING_STATUS.GEACCEPTEERD
    );
  }

  get isProcessingDenied() {
    return this.args.feedback.processingStatus === PROCESSING_STATUS.GEWEIGERD;
  }
}
