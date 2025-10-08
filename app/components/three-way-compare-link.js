import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import ThreeWayCompareModal from 'frontend-lpdc/components/three-way-compare-modal';
import ThreeWayComparisonFormGenerator from 'frontend-lpdc/helpers/three-way-comparison-form-generator';
import { EXT } from 'frontend-lpdc/rdf/namespaces';
import { NamedNode } from 'rdflib';
import { isEqual } from 'lodash';
import { tracked } from '@glimmer/tracking';

export default class ThreeWayCompareLinkComponent extends Component {
  @service modals;
  @service contextService;
  @tracked isConceptTakenOver = false;

  formGenerator = new ThreeWayComparisonFormGenerator(
    this.args.originalStoreOptions,
  );

  constructor() {
    super(...arguments);
    this.contextService
      .findParentContextWithContract('registerInstanceFormSaveMethod')
      ?.registerInstanceFormSaveMethod((values) => {
        this.args.updateValues(values);
      });
  }

  @action
  openModal() {
    const { instance, conceptSnapshotCurrent, conceptSnapshotLatest } =
      this.formGenerator.getForms(this.args.field.uri);
    this.modals.open(ThreeWayCompareModal, {
      field: this.args.field,
      instanceForm: instance,
      conceptSnapshotCurrentForm: conceptSnapshotCurrent,
      conceptSnapshotLatestForm: conceptSnapshotLatest,
      fieldName: instance.originalFormFieldTitle,
      saveHandler: (values) => {
        this.args.updateValues(values);
        this.isConceptTakenOver = true;
      },
    });
  }

  get visible() {
    const sourceNodeCurrent = this.formGenerator.getSourceNode('current');
    const sourceNodeLatest = this.formGenerator.getSourceNode('latest');
    const currentSnapshotValues =
      this.formGenerator.getSortedLiteralValuesForPath(
        sourceNodeCurrent,
        new NamedNode(this.args.field.path),
      );
    const latestSnapshotValues =
      this.formGenerator.getSortedLiteralValuesForPath(
        sourceNodeLatest,
        new NamedNode(this.args.field.path),
      );

    const sourceAndLatestExistButContentDifferent =
      sourceNodeCurrent &&
      sourceNodeLatest &&
      !isEqual(currentSnapshotValues.sort(), latestSnapshotValues.sort());
    const sourceCurrentPresentSourceLatestAbsent =
      sourceNodeCurrent && !sourceNodeLatest && currentSnapshotValues.length;
    const sourceCurrentAbsentSourceLatestPresent =
      !sourceNodeCurrent && sourceNodeLatest && latestSnapshotValues.length;

    return (
      this.args.visible &&
      this.formGenerator.getFormNode().value === EXT('form').value &&
      (sourceAndLatestExistButContentDifferent ||
        sourceCurrentPresentSourceLatestAbsent ||
        sourceCurrentAbsentSourceLatestPresent)
    );
  }
}
