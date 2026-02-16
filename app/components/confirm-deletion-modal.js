import { action } from '@ember/object';
import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class ConfirmDeletionModalComponent extends Component {
  delete = dropTask(async () => {
    await this.args.data.deleteHandler();
    this.args.close();
  });

  @action
  close() {
    if (this.delete.isIdle) {
      this.args.close();
    }
  }
}
