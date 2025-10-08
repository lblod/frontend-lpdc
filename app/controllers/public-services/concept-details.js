import Controller from '@ember/controller';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';

const ARCHIVED_STATUS =
  'http://lblod.data.gift/concepts/concept-status/gearchiveerd';

export default class PublicServicesConceptDetailsController extends Controller {
  @service router;
  @service('public-service') publicServiceService;
  @service('concept') conceptService;
  queryParams = [{ isPreview: 'preview', publicServiceId: 'id' }];
  isPreview = false;
  publicServiceId = '';

  get isLinkFlowPreview() {
    return Boolean(this.publicServiceId);
  }

  get isArchived() {
    return this.model.concept.status?.uri === ARCHIVED_STATUS;
  }

  get isConceptLanguageVersionGenerated() {
    return this.model.languageVersionOfConcept.includes('generated');
  }

  @action
  async hideNewConceptMessage() {
    try {
      await this.conceptService.removeIsNewConceptFlag(
        this.model.concept.displayConfiguration,
      );
      await this.conceptService.loadConceptDetails(this.model.concept.id);
    } catch (error) {
      // TODO: Something went wrong while saving, but a fully fledged error state seems overkill. We should send a message to GlitchTip.
    }
  }

  @dropTask
  *createPublicService(conceptUuid) {
    const concept = yield this.conceptService.loadConceptDetails(conceptUuid);
    const publicServiceUuid =
      yield this.publicServiceService.createPublicService(concept.uri);

    this.router.transitionTo('public-services.details', publicServiceUuid);
  }

  @dropTask
  *linkConcept() {
    const { concept } = this.model;
    const publicService =
      yield this.publicServiceService.loadPublicServiceDetails(
        this.publicServiceId,
      );
    yield this.publicServiceService.linkConcept(publicService, concept);
    this.router.replaceWith('public-services.details', publicService.id);
  }
}
