import Component from '@glimmer/component';
import { action } from '@ember/object';
import { NamedNode } from 'rdflib';
import { inject as service } from '@ember/service';

export default class ThreeWayCompareModalComponent extends Component {
  @service contextService;
  instanceFormSaveMethod;

  constructor() {
    super(...arguments);
    this.contextService.addParentContext(this);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.contextService.removeParentContext(this);
  }

  @action
  close() {
    this.args.close();
  }

  registerInstanceFormSaveMethod(fn) {
    this.instanceFormSaveMethod = fn;
  }

  @action
  takeOver() {
    const valueLiterals = this.args.data.conceptSnapshotLatestForm.formStore
      .match(
        this.args.data.conceptSnapshotLatestForm.sourceNode,
        new NamedNode(this.args.data.field.path),
        undefined,
        this.args.data.conceptSnapshotLatestForm.graphs.sourceGraph,
      )
      .map((t) => t.object.value)
      .filter((it) => !!it);

    this.instanceFormSaveMethod(valueLiterals);
  }

  @action
  save() {
    const valueLiterals = this.args.data.instanceForm.formStore
      .match(
        this.args.data.instanceForm.sourceNode,
        new NamedNode(this.args.data.field.path),
        undefined,
        this.args.data.instanceForm.graphs.sourceGraph,
      )
      .map((t) => t.object.value)
      .filter((it) => !!it);

    this.args.data.saveHandler(valueLiterals);
    this.close();
  }
}
