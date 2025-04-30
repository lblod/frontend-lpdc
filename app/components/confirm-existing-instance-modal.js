import { action } from '@ember/object';
import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class ConfirmExistingInstanceModalComponent extends Component {
  @dropTask
  *createNewInstance() {
    yield this.args.data.createNewInstanceHandler();
    this.args.close();
  }

  @action
  close() {
    if (this.createNewInstance.isIdle) {
      this.args.close();
    }
  }
}
