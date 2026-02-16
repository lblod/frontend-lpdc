import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';

export default class SelectUOrJeModalComponent extends Component {
  @tracked
  selectedVorm;
  @tracked
  showFormError = false;

  @action
  close() {
    this.args.close();
  }

  @action
  handleChangedVorm(value) {
    this.selectedVorm = value;
    this.showFormError = false;
  }

  confirm = dropTask(async () => {
    if (this.selectedVorm) {
      await this.args.data.submitHandler(this.selectedVorm);
      this.close();
    } else {
      this.showFormError = true;
    }
  });

  @action
  makeChoiceLater() {
    this.args.data.makeChoiceLaterHandler();
    this.close();
  }
}
