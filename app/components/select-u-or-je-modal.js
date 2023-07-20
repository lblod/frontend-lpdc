import Component from '@glimmer/component';
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

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

  @action
  confirm() {
    if (this.selectedVorm) {
      this.args.data.submitHandler(this.selectedVorm);
      this.close();
    } else {
      this.showFormError = true;
    }
  }
}
