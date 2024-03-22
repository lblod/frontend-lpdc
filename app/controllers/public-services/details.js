import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask, task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { FORM, RDF } from 'frontend-lpdc/rdf/namespaces';
import { NamedNode } from 'rdflib';

const FORM_GRAPHS = {
  formGraph: new NamedNode('http://data.lblod.info/form'),
  metaGraph: new NamedNode('http://data.lblod.info/metagraph'),
  sourceGraph: new NamedNode(`http://data.lblod.info/sourcegraph`),
};

export default class PublicServicesDetailsController extends Controller {
  @service store;
  @service('public-service') publicServiceService;

  @tracked formId = 'inhoud';
  // @tracked form = this.model.initialForm;

  get form() {
    console.log(this.loadForm.state);
    if (this.loadForm.isFinished) {
      return this.model.loadPublicServices.value;
    }

    return this.model.loadedPublicServices || [];
  }

  get isInhoudTabActive() {
    return this.formId === 'inhoud';
  }

  get isEigenschappenTabActive() {
    return this.formId === 'eigenschappen';
  }

  @action
  changeTab(formId) {
    this.formId = formId;
    this.loadForm.perform();
  }

  @dropTask
  *markAsReviewed() {
    yield this.publicServiceService.confirmBijgewerktTotLatestFunctionalChange(
      this.model.publicService
    );
  }

  @dropTask()
  *unlinkConcept() {
    const { publicService } = this.model;
    yield this.publicServiceService.unlinkConcept(publicService);
  }

  @task
  *loadForm() {
    const {
      form: formTtl,
      meta: metaTtl,
      source: sourceTtl,
    } = yield this.publicServiceService.getPublicServiceForm(
      this.model.publicService.uri,
      this.formId
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

    // if (!this.model.readOnly) {
    //   formStore.registerObserver(this.updateFormDirtyState, this.id);
    // }
    this.form = {
      form,
      formStore,
    };
  }
}
