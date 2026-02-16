import { action } from '@ember/object';
import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class ConfirmReopeningModalComponent extends Component {
  reopen = dropTask(async () => {
    await this.args.data.reopeningHandler();
    this.args.close();
  });

  @action
  close() {
    if (this.reopen.isIdle) {
      this.args.close();
    }
  }
}
