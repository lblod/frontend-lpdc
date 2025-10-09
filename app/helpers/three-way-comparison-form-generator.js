import { EXT, FORM, PROV, RDF, SHACL } from 'frontend-lpdc/rdf/namespaces';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { BlankNode, Literal, Statement } from 'rdflib';
import moment from 'moment';

export default class ThreeWayComparisonFormGenerator {
  storeOptions;

  constructor(originalStoreOptions) {
    this.storeOptions = originalStoreOptions;
  }

  getForms(originalFormFieldUri) {
    const metaTriples = this.createMetaTriples();
    const instanceForm = this.createFormStoreForField(
      originalFormFieldUri,
      'Instantie',
      metaTriples,
    );
    const conceptSnapshotCurrent = this.createFormStoreForField(
      originalFormFieldUri,
      `Concept waarop instantie is gebaseerd (${this.findGeneratedAtDateOfConceptSnapshot(
        'current',
      )})`,
      metaTriples,
    );

    const conceptSnapshotLatest = this.createFormStoreForField(
      originalFormFieldUri,
      `Meest recente concept (${this.findGeneratedAtDateOfConceptSnapshot(
        'latest',
      )})`,
      metaTriples,
    );

    return {
      instance: {
        form: instanceForm.form,
        sourceNode: this.storeOptions.sourceNode,
        graphs: this.getGraphs(),
        formStore: instanceForm.formStore,
        originalFormFieldTitle: instanceForm.originalFormFieldTitle,
      },
      conceptSnapshotCurrent: {
        form: conceptSnapshotCurrent.form,
        sourceNode: this.getSourceNode('current') || new BlankNode(),
        graphs: this.getGraphs(),
        formStore: conceptSnapshotCurrent.formStore,
        originalFormFieldTitle: conceptSnapshotCurrent.originalFormFieldTitle,
      },
      conceptSnapshotLatest: {
        form: conceptSnapshotLatest.form,
        sourceNode: this.getSourceNode('latest') || new BlankNode(),
        graphs: this.getGraphs(),
        formStore: conceptSnapshotLatest.formStore,
        originalFormFieldTitle: conceptSnapshotLatest.originalFormFieldTitle,
      },
    };
  }

  getSortedLiteralValuesForPath(
    sourceNode,
    path,
    graph = this.getGraphs().metaGraph,
  ) {
    return this.storeOptions.store
      .match(sourceNode, path, undefined, graph)
      .map((triple) => triple.object.value)
      .sort();
  }

  getFormNode() {
    return this.storeOptions.store.any(
      undefined,
      RDF('type'),
      FORM('Form'),
      this.storeOptions.formGraph,
    );
  }

  getSourceNode(type) {
    return this.storeOptions.store.any(
      this.storeOptions.sourceNode,
      type === 'current'
        ? EXT('comparisonSourceCurrent')
        : EXT('comparisonSourceLatest'),
      undefined,
      this.storeOptions.metaGraph,
    );
  }

  getGraphs() {
    return {
      formGraph: this.storeOptions.formGraph,
      sourceGraph: this.storeOptions.sourceGraph,
      metaGraph: this.storeOptions.metaGraph,
    };
  }

  createFormStoreForField(fieldIri, newFieldTitle, metaTriples) {
    const { formTriples, form, originalFormFieldTitle } =
      this.createFormTriples(fieldIri, newFieldTitle);
    const sourceTriples = this.createSourceTriples(metaTriples);
    const formStore = new ForkingStore();
    formStore.addAll([...formTriples, ...sourceTriples, ...metaTriples]);
    return {
      formStore: formStore,
      form: form,
      originalFormFieldTitle: originalFormFieldTitle,
    };
  }

  createFormTriples(fieldIri, newFieldTitle) {
    let originalFormFieldTitle;
    const formFieldTriples = this.storeOptions.store
      .match(fieldIri, undefined, undefined, undefined)
      .map((triple) => {
        if (triple.predicate.value === SHACL('name').value) {
          originalFormFieldTitle = triple.object.value;
          return new Statement(
            triple.subject,
            triple.predicate,
            new Literal(newFieldTitle),
            triple.graph,
          );
        }
        return triple;
      });

    const formIri = EXT('three-way-comparison-form');
    const form = [
      new Statement(
        formIri,
        RDF('type'),
        FORM('Form'),
        this.storeOptions.formGraph,
      ),
      new Statement(
        formIri,
        RDF('type'),
        FORM('TopLevelForm'),
        this.storeOptions.formGraph,
      ),
      new Statement(
        formIri,
        FORM('includes'),
        fieldIri,
        this.storeOptions.formGraph,
      ),
    ];

    const groupIri = this.storeOptions.store.any(
      fieldIri,
      SHACL('group'),
      undefined,
      this.storeOptions.formGraph,
    );

    const group = this.storeOptions.store.match(
      groupIri,
      RDF('type'),
      undefined,
      this.storeOptions.formGraph,
    );

    const validationIds = this.storeOptions.store.match(
      fieldIri,
      FORM('validations'),
      undefined,
      this.storeOptions.formGraph,
    );

    const validations = validationIds.flatMap((v) =>
      this.storeOptions.store.match(v.object, undefined, undefined, undefined),
    );

    return {
      formTriples: [...form, ...formFieldTriples, ...group, ...validations],
      form: formIri,
      originalFormFieldTitle: originalFormFieldTitle,
    };
  }

  createSourceTriples(metaTriples) {
    const source = this.storeOptions.store.match(
      undefined,
      undefined,
      undefined,
      this.storeOptions.sourceGraph,
    );

    const conceptSnapshotSource = metaTriples.map(
      (t) =>
        new Statement(
          t.subject,
          t.predicate,
          t.object,
          this.storeOptions.sourceGraph,
        ),
    );
    return [...source, ...conceptSnapshotSource];
  }

  createMetaTriples() {
    return this.storeOptions.store.match(
      undefined,
      undefined,
      undefined,
      this.storeOptions.metaGraph,
    );
  }

  findGeneratedAtDateOfConceptSnapshot(type) {
    const dateValue = this.storeOptions.store
      .match(
        undefined,
        type === 'current'
          ? EXT('comparisonSourceCurrent')
          : EXT('comparisonSourceLatest'),
        undefined,
        this.storeOptions.metaGraph,
      )
      .map((t) =>
        this.storeOptions.store.any(
          t.object,
          PROV('generatedAtTime'),
          undefined,
          this.storeOptions.metaGraph,
        ),
      )
      .filter((it) => !!it)[0].value;

    return moment.utc(dateValue).local().format('DD-MM-YYYY - HH:mm');
  }
}
