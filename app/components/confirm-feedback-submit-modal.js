import { action } from '@ember/object';
import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class ConfirmFeedbackSubmitModalComponent extends Component {
  @tracked antwoordText = '';

  @dropTask
  *submit() {
    yield this.args.data.submitHandler(this.antwoordText);
    this.args.close();
  }

  @action
  close() {
    if (this.submit.isIdle) {
      this.args.close();
    }
  }

  @action
  handleAntwoordChange(event) {
    this.antwoordText = event.target.value;
  }
}
