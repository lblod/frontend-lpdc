import Component from '@glimmer/component';
import { action } from '@ember/object';
import { NamedNode } from 'rdflib';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ThreeWayCompareModalComponent extends Component {
  @service contextService;
  instanceFormSaveMethod;

  @tracked hasChanges = false;
  @tracked formValuesMatchConcept = false;
  #observerId = 'three-way-compare-modal';
  #originalValues = null;

  constructor() {
    super(...arguments);
    this.contextService.addParentContext(this);
    this.trackFormChanges();
  }

  get isSubmitDisabled() {
    return !this.hasChanges;
  }

  get hasTakenOverValue() {
    return this.formValuesMatchConcept;
  }

  trackFormChanges() {
    // We delay the observer registration since it is otherwise added before the initial data entry batch callback is called, which then immediately triggers the observer while there weren't any user changes.
    // Not sure if this is a bug in the ForkingStore or if we're adding the initial data in the "wrong" way.
    setTimeout(() => {
      this.#originalValues = getValuesFor(
        this.args.data.instanceForm,
        this.args.data.field.path,
      );
      this.args.data.instanceForm.formStore.registerObserver(() => {
        this.updateState();
      }, this.#observerId);

      // Also derive the initial state from the actual store values, so e.g. a modal
      // reopened after the values were taken over already shows the correct button state.
      this.updateState();
    }, 10);
  }

  updateState() {
    const instanceValues = getValuesFor(
      this.args.data.instanceForm,
      this.args.data.field.path,
    );
    const conceptValues = getValuesFor(
      this.args.data.conceptSnapshotLatestForm,
      this.args.data.field.path,
    );

    this.hasChanges = !valuesEqual(instanceValues, this.#originalValues);
    this.formValuesMatchConcept = valuesEqual(instanceValues, conceptValues);
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

  registerInstanceFormSaveMethod(storeOptions, fn) {
    // Only accept the registration of the link that belongs to this modal's own bottom form.
    // All other links (e.g. the one on the details page) register for a different store and must be ignored,
    // independent of which component happened to mount or register last.
    if (storeOptions?.store !== this.args.data.instanceForm.formStore) {
      return;
    }

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

    this.instanceFormSaveMethod?.(valueLiterals);
    this.updateState();
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

function getValuesFor(form, path) {
  return form.formStore
    .match(
      form.sourceNode,
      new NamedNode(path),
      undefined,
      form.graphs.sourceGraph,
    )
    .map((t) => t.object.value)
    .filter((it) => !!it)
    .sort();
}

function valuesEqual(values, otherValues) {
  if (!otherValues) {
    return false;
  }

  return (
    values.length === otherValues.length &&
    values.every((value, index) => value === otherValues[index])
  );
}
