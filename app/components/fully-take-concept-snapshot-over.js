import { action } from '@ember/object';
import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class FullyTakeConceptSnapshotOverModalComponent extends Component {
  fullyTakeConceptSnapshotOver = dropTask(async () => {
    await this.args.data.fullyTakeConceptSnapshotOverHandler();
    this.args.close();
  });

  updateConceptSnapshotByField = dropTask(async () => {
    await this.args.data.updateConceptSnapshotByFieldHandler();
    this.args.close();
  });

  @action
  close() {
    this.args.close();
  }
}
