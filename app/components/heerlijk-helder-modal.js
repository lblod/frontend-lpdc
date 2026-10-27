import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class HeerlijkHelderModalComponent extends Component {
  @tracked isImproved;

  constructor() {
    super(...arguments);
  }

  willDestroy() {
    super.willDestroy(...arguments);
  }

  @action
  close() {
    this.args.close();
  }

  @action
  save() {
    this.close();
  }

  @action
  rateRewrite(value) {
    this.isImproved = this.isImproved === value ? null : value;
  }
}
