import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import ConfirmFeedbackSubmitModal from './confirm-feedback-submit-modal';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FeedbackComponent extends Component {
  @service modals;
  // TODO: use the actual statuses
  // currently true => processed, false => denied
  @tracked feedbackStatus;
  @tracked date = '26-01-2026';
  @tracked organization = 'Gemeente Gent';
  @tracked feedbackExpanded = true;

  @action
  toggleFeedback() {
    this.feedbackExpanded = !this.feedbackExpanded;
  }

  @task
  *sendAnswer() {
    yield this.modals.open(ConfirmFeedbackSubmitModal, {
      feedbackAccepted: this.feedbackStatus,
      submitHandler: async (value) => {
        console.log(
          'Feedback processed: ',
          this.feedbackStatus ? 'accepted' : 'denied',
        );
        console.log('answer:', value);
      },
    });
  }

  get mockText() {
    // return '<h4>Lorem ipsum</h4> dolor sit amet consectetur. Velit suspendisse dolor posuere in cursus mauris tellus diam semper. Nulla ut at quam ut et. Nisi venenatis at morbi malesuada ut erat orci malesuada. Pharetra fringilla facilisi dignissim.Pharetra fringilla facilisi dignissim.Pharetra fringilla facilisi dignissim.';
    return `Bedankt. Als gebruiker is het wel nog wat verwarrend: in de inleiding staat voor iedere inwoner, lager bij voorwaarden staan voorwaarden.

Voorstel:

Titel: Korting op warme maaltijden
Beschrijving:

Iedere inwoner van Merksplas kan een warme maaltijd aanvragen via het OCMW. Heb je een leefloon of een IGO, dan krijg je korting.
Bewijsstukken: wat bedoel je met een geldig attest?`;
  }

  @action
  markFeedbackDenied() {
    this.feedbackStatus = false;
  }
  @action
  markFeedbackProcessed() {
    this.feedbackStatus = true;
  }
}
