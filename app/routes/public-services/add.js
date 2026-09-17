import { service } from '@ember/service';
import AbstractConceptOverviewRoute from 'frontend-lpdc/routes/public-services/abstract-concept-overview-route';

export default class PublicServicesAddRoute extends AbstractConceptOverviewRoute {
  @service store;
  @service formalInformalChoice;
  @service('concept') conceptService;

  async model(params) {
    return {
      ...this.modelFor('public-services'),
      loadConceptualPublicServices:
        this.loadConceptualPublicServicesTask.perform(params),
      loadedConceptualPublicServices:
        this.loadConceptualPublicServicesTask.lastSuccessful?.value,
      formalInformalChoice: await this.formalInformalChoice.getChoice(),
    };
  }
}
