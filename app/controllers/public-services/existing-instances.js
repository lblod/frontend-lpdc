import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import ConfirmDeletionModal from 'frontend-lpdc/components/confirm-deletion-modal';
import { tracked } from '@glimmer/tracking';

export default class PublicServicesExistingInstancesController extends Controller {
  @service router;
  @service modals;
  @service('public-service') publicServiceService;
  @service('concept') conceptService;
  @tracked sort = '-date-modified';
  @tracked page = 0;
  queryParams = [{ publicServiceId: 'id' }];
  publicServiceId = '';

  get isLinkFlowPreview() {
    return Boolean(this.publicServiceId);
  }

  @dropTask
  *createPublicService(conceptUuid) {
    const concept = yield this.conceptService.loadConceptDetails(conceptUuid);
    const publicServiceUuid =
      yield this.publicServiceService.createPublicService(concept.uri);

    this.router.transitionTo('public-services.details', publicServiceUuid);
  }

  @action
  removePublicService(uri) {
    this.modals.open(ConfirmDeletionModal, {
      deleteHandler: async () => {
        await this.publicServiceService.deletePublicService(uri);
        this.router.refresh('public-services.existing-instances');
      },
    });
  }

  @dropTask
  *linkConcept() {
    const { concept } = this.model;
    const publicService =
      yield this.publicServiceService.loadPublicServiceDetails(
        this.publicServiceId
      );
    yield this.publicServiceService.linkConcept(publicService, concept);
    this.router.replaceWith('public-services.details', publicService.id);
  }
}
