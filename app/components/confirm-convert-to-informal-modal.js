import { action } from '@ember/object';
import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class ConfirmConvertToInformalModalComponent extends Component {
  convertToInformal = dropTask(async () => {
    await this.args.data.convertToInformalHandler();
    this.args.close();
  });

  @action
  close() {
    this.args.close();
  }
}
