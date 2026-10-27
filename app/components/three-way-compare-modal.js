import Component from '@glimmer/component';
import { action } from '@ember/object';
import { NamedNode } from 'rdflib';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ThreeWayCompareModalComponent extends Component {
  @service contextService;
  instanceFormSaveMethod;

  @tracked hasChanges = false;
  #observerId = 'three-way-compare-modal';

  constructor() {
    super(...arguments);
    this.contextService.addParentContext(this);
    this.trackFormChanges();
  }

  get isSubmitDisabled() {
    return !this.hasChanges;
  }

  trackFormChanges() {
    // We delay the observer registration since it is otherwise added before the initial data entry batch callback is called, which then immediately triggers the observer while there weren't any user changes.
    // Not sure if this is a bug in the ForkingStore or if we're adding the initial data in the "wrong" way.
    setTimeout(() => {
      this.args.data.instanceForm.formStore.registerObserver(() => {
        this.hasChanges = true;
      }, this.#observerId);
    }, 10);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.contextService.removeParentContext(this);
    this.args.data.instanceForm.formStore.deregisterObserver(this.#observerId);
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
    this.hasChanges = true;

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
