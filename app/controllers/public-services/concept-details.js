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

  createPublicService = dropTask(async (conceptUuid) => {
    const concept = await this.conceptService.loadConceptDetails(conceptUuid);
    const publicServiceUuid =
      await this.publicServiceService.createPublicService(concept.uri);

    this.router.transitionTo('public-services.details', publicServiceUuid);
  });

  linkConcept = dropTask(async () => {
    const { concept } = this.model;
    const publicService =
      await this.publicServiceService.loadPublicServiceDetails(
        this.publicServiceId,
      );
    await this.publicServiceService.linkConcept(publicService, concept);
    this.router.replaceWith('public-services.details', publicService.id);
  });
}
