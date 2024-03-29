import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { NamedNode } from 'rdflib';
import { task } from 'ember-concurrency';
import { FORM, RDF } from 'frontend-lpdc/rdf/namespaces';

const FORM_GRAPHS = {
  formGraph: new NamedNode('http://data.lblod.info/form'),
  metaGraph: new NamedNode('http://data.lblod.info/metagraph'),
  sourceGraph: new NamedNode(`http://data.lblod.info/sourcegraph`),
};

export default class DetailsPageComponent extends Component {
  @service router;
  @service store;
  @service('concept') conceptService;

  id = guidFor(this);
  form;
  formStore;
  graphs = FORM_GRAPHS;

  constructor() {
    super(...arguments);
    this.loadForm.perform();
    this.sourceNode = new NamedNode(this.args.concept.uri);
  }

  @task
  *loadForm() {
    const {
      form: formTtl,
      meta: metaTtl,
      source: sourceTtl,
    } = yield this.conceptService.getConceptForm(
      this.args.concept.uri,
      this.args.formId
    );

    let formStore = new ForkingStore();
    formStore.parse(formTtl, FORM_GRAPHS.formGraph, 'text/turtle');
    formStore.parse(metaTtl, FORM_GRAPHS.metaGraph, 'text/turtle');
    formStore.parse(sourceTtl, FORM_GRAPHS.sourceGraph, 'text/turtle');

    let form = formStore.any(
      undefined,
      RDF('type'),
      FORM('Form'),
      FORM_GRAPHS.formGraph
    );

    this.form = form;
    this.formStore = formStore;
  }
}
