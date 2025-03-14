import { action } from '@ember/object';
import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class ConfirmSaveWithValidationWarningModal extends Component {
  @dropTask
  *submit() {
    yield this.args.data.submitHandler();
    this.args.close();
  }

  @action
  close() {
    if (this.submit.isIdle) {
      this.args.close();
    }
  }
}
