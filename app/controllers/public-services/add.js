import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import SelectUOrJeModalComponent from 'frontend-lpdc/components/select-u-or-je-modal';
import AbstractConceptOverviewController from 'frontend-lpdc/controllers/public-services/abstract-concept-overview-controller';

export default class PublicServicesAddController extends AbstractConceptOverviewController {
  @service router;
  @service modals;
  @service('public-service') publicServiceService;
  @service('concept') conceptService;
  @service('formal-informal-choice') formalInformalChoiceService;
  @tracked formalInformalChoice = this.model.formalInformalChoice;

  @action
  async openSelectUOrJeModal() {
    const hasPublicServices =
      await this.publicServiceService.bestuurseenheidHasPublicServices();
    this.modals.open(SelectUOrJeModalComponent, {
      newLpdcUser: !hasPublicServices,
      submitHandler: async (value) => {
        await this.formalInformalChoiceService.saveChoice(value);
        this.formalInformalChoice =
          await this.formalInformalChoiceService.getChoice();
      },
      makeChoiceLaterHandler: () => {
        this.formalInformalChoiceService.makeChoiceLater();
      },
    });
  }

  @dropTask
  *createPublicService(conceptUuid) {
    const conceptId = conceptUuid
      ? (yield this.conceptService.loadConceptDetails(conceptUuid)).uri
      : undefined;
    const publicServiceUuid =
      yield this.publicServiceService.createPublicService(conceptId);
    this.router.transitionTo('public-services.details', publicServiceUuid);
  }
}
