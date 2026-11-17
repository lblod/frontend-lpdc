import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import DecisionLinkingModalComponent from 'frontend-lpdc/components/decision-linking-modal';

export default class DecisionsDetailComponent extends Component {
  @service modals;
  @tracked selected = this.args.decisions?.[0];

  @action
  linkDecision() {
    this.modals.open(DecisionLinkingModalComponent, {
      publicService: this.args.publicService,
    });
  }

  @action
  selectDecision(decision) {
    this.selected = decision;
  }
}
