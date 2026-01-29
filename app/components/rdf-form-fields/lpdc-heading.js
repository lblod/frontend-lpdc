import Component from '@glimmer/component';
import { NamedNode } from 'rdflib';
import ThreeWayComparisonFormGenerator from 'frontend-lpdc/helpers/three-way-comparison-form-generator';
import { EXT, RDF } from 'frontend-lpdc/rdf/namespaces';
import getUUIDFromUri from 'frontend-lpdc/helpers/get-uuid-from-uri';
import ENV from 'frontend-lpdc/config/environment';

export default class LpdcRdfHeadingComponent extends Component {
  get skin() {
    return this.args.field.options.skin;
  }

  get level() {
    return this.args.field.options.level;
  }

  get pillText() {
    return this.args.field.options.pillText;
  }

  get tooltipText() {
    return this.args.field.options.tooltipText;
  }

  get showPill() {
    const formGenerator = new ThreeWayComparisonFormGenerator({
      store: this.args.formStore,
      sourceNode: this.args.sourceNode,
      formGraph: this.args.formStore.formGraph,
      metaGraph: this.args.formStore.metaGraph,
      sourceGraph: this.args.formStore.sourceGraph,
    });
    const countConceptSnapshotCurrent = this.args.formStore.match(
      formGenerator.getSourceNode('current'),
      new NamedNode(this.args.field.options.path),
      undefined,
      formGenerator.getGraphs().metaGraph,
    ).length;
    const countConceptSnapshotLatest = this.args.formStore.match(
      formGenerator.getSourceNode('latest'),
      new NamedNode(this.args.field.options.path),
      undefined,
      formGenerator.getGraphs().metaGraph,
    ).length;

    return (
      !this.args.show &&
      countConceptSnapshotLatest !== countConceptSnapshotCurrent
    );
  }

  get ipdcConceptCompareLink() {
    const dutchLanguageVariant = this.args.formStore.match(
      undefined,
      new NamedNode(
        'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant',
      ),
      undefined,
      this.args.formStore.sourceGraph,
    )[0].object.value;
    const languageVersion =
      dutchLanguageVariant === 'nl-be-x-informal' ? 'nl/informeel' : 'nl';
    const productId = this.args.formStore.match(
      undefined,
      new NamedNode('http://schema.org/productID'),
      undefined,
      this.args.formStore.sourceGraph,
    )[0].object.value;

    const currentConceptSnapshot = getUUIDFromUri(
      this.getConceptSnapshotIri('current'),
    );
    const latestConceptSnapshot = getUUIDFromUri(
      this.getConceptSnapshotIri('latest'),
    );

    return `${ENV.ipdcUrl}/${languageVersion}/concept/${productId}/revisie/vergelijk?revisie1=${currentConceptSnapshot}&revisie2=${latestConceptSnapshot}`;
  }

  getConceptSnapshotIri(type) {
    return this.args.formStore
      .match(
        undefined,
        type === 'current'
          ? EXT('comparisonSourceCurrent')
          : EXT('comparisonSourceLatest'),
        undefined,
        this.args.formStore.metaGraph,
      )
      .map(
        (t) =>
          this.args.formStore.match(
            t.object,
            RDF('type'),
            new NamedNode(
              'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot',
            ),
            this.args.formStore.metaGraph,
          )[0],
      )
      .filter((it) => !!it)[0].subject.value;
  }

  get isLinkedToConcept() {
    const { formStore, sourceNode, graphs } = this.args;

    // Check if there's a concept linked via dct:source
    const conceptLink = formStore.any(
      sourceNode,
      new NamedNode('http://purl.org/dc/terms/source'),
      undefined,
      graphs.sourceGraph,
    );

    return !!conceptLink;
  }
}
