import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { FORM, RDF } from 'frontend-lpdc/rdf/namespaces';
import { NamedNode } from 'rdflib';

const FORM_GRAPHS = {
  formGraph: new NamedNode('http://data.lblod.info/form'),
  metaGraph: new NamedNode('http://data.lblod.info/metagraph'),
  sourceGraph: new NamedNode(`http://data.lblod.info/sourcegraph`),
};

export default class PublicServicesDetailsRoute extends Route {
  @service('public-service') publicServiceService;
  @service('concept') conceptService;
  @service router;

  async model(params) {
    const publicService =
      await this.publicServiceService.loadPublicServiceDetails(
        params.serviceId
      );
    const readOnly =
      publicService.status.uri !==
      'http://lblod.data.gift/concepts/instance-status/ontwerp';

    const concept = publicService.concept.id
      ? await this.conceptService.loadConceptDetails(publicService.concept.id)
      : undefined;

    const languageVersionOfConcept = concept
      ? await this.conceptService.loadConceptLanguageVersionByConceptUri(
          concept.uri
        )
      : undefined;

    const publicServiceLanguageVersion =
      await this.publicServiceService.loadPublicServiceLanguageVersion(
        publicService.uri
      );

    const initialForm = await this.loadForm('inhoud', publicService.uri)

    return {
      publicService,
      readOnly,
      languageVersionOfConcept,
      publicServiceLanguageVersion,
      initialForm,
    };
  }

  setupController(controller, { publicService }) {
    super.setupController(...arguments);

    controller.reviewStatus = publicService.reviewStatus;
  }

  async loadForm(formId, publicServiceUri) {
    const {
      form: formTtl,
      meta: metaTtl,
      source: sourceTtl,
    } = await this.publicServiceService.getPublicServiceForm(
      publicServiceUri,
      formId
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

    if (!this.model.readOnly) {
      formStore.registerObserver(this.updateFormDirtyState, this.id);
    }

    return {
      form,
      formStore,
    };
  }
}
