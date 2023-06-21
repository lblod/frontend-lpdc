import { action } from '@ember/object';
import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class ConfirmReopeningModalComponent extends Component {
  @dropTask
  *reopen() {
    yield this.args.data.reopeningHandler();
    this.args.close();
  }

  @action
  close() {
    if (this.reopen.isIdle) {
      this.args.close();
    }
  }
}
