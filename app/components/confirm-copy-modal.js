import { action } from '@ember/object';
import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class ConfirmCopyModalComponent extends Component {
  copyForMunicipalityMerger = dropTask(async () => {
    await this.args.data.copyHandler(true);
    this.args.close();
  });

  copyNotForMunicipalityMerger = dropTask(async () => {
    await this.args.data.copyHandler(false);
    this.args.close();
  });

  @action
  close() {
    if (
      this.copyForMunicipalityMerger.isIdle &&
      this.copyNotForMunicipalityMerger.isIdle
    ) {
      this.args.close();
    }
  }
}
