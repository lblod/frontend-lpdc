import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import AbstractConceptOverviewController from 'frontend-lpdc/controllers/public-services/abstract-concept-overview-controller';

export default class PublicServicesLinkConceptIndexController extends AbstractConceptOverviewController {
  @service router;
  @service('public-service') publicServiceService;

  linkConcept = dropTask(async (concept) => {
    const { publicService } = this.model;
    await this.publicServiceService.linkConcept(publicService, concept);
    this.router.replaceWith('public-services.details', publicService.id);
  });
}
