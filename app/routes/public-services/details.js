import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublicServicesDetailsRoute extends Route {
  @service('public-service') publicServiceService;
  @service('concept') conceptService;
  @service('formal-informal-choice') formalInformalChoiceService;
  @service('concept-snapshot') conceptSnapshotService;

  async model({ serviceId }) {
    const publicService =
      await this.publicServiceService.loadPublicServiceDetails(serviceId);
    const readOnly =
      publicService.status.uri !==
      'http://lblod.data.gift/concepts/instance-status/ontwerp';

    const concept = publicService.concept.id
      ? await this.conceptService.loadConceptDetails(publicService.concept.id)
      : undefined;

    const languageVersionOfConcept = concept
      ? await this.conceptService.loadConceptLanguageVersionByConceptUri(
          concept.uri,
        )
      : undefined;

    const formalInformalChoice =
      await this.formalInformalChoiceService.getChoice();

    const functionallyChangedFields =
      await this.conceptSnapshotService.getFunctionallyChangedFields(
        publicService.versionedSource,
        publicService.concept.get('hasLatestFunctionalChange'),
      );

    const publicServiceIsPublished =
      await this.publicServiceService.isPublished(publicService);

    return {
      publicService,
      readOnly,
      languageVersionOfConcept,
      formalInformalChoice,
      functionallyChangedFields,
      publicServiceIsPublished,
    };
  }

  setupController(controller, { publicService }) {
    super.setupController(...arguments);

    controller.reviewStatus = publicService.reviewStatus;
  }
}
