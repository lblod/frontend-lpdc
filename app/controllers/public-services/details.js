import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { hasConcept } from 'frontend-lpdc/models/public-service';
import { inject as service } from '@ember/service';

export default class PublicServicesDetailsController extends Controller {
  @service store;
  @service modals;
  @service('public-service') publicServiceService;
  @service router;
  @service contextService;

  @tracked shouldShowUnlinkWarning = false;
  @tracked formHasUnsavedChanges = false;

  constructor() {
    super(...arguments);
    this.contextService.addParentContext(this);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.contextService.removeParentContext(this);
  }

  get canLinkConcept() {
    const { publicService } = this.model;

    return !hasConcept(publicService) && !publicService.isSent;
  }

  get canUnlinkConcept() {
    const { publicService } = this.model;
    return (
      hasConcept(publicService) &&
      !publicService.isSent &&
      !this.shouldShowUnlinkWarning
    );
  }
  get publicServiceDutchLanguageVariant() {
    switch (this.model.publicService.dutchLanguageVariant) {
      case 'nl-be-x-informal':
        return 'je-versie';
      case 'nl-be-x-formal':
        return 'u-versie';
      default:
        return 'u/je onbepaald';
    }
  }

  get shouldDisplayVersion() {
    return this.model.formalInformalChoice?.chosenForm === 'informal';
  }

  get shouldShowContentGeneratedWarning() {
    return (
      this.isNewlyCreatedPublicService &&
      this.publicServiceHasConcept &&
      this.isConceptLanguageVersionGenerated
    );
  }

  get publicServiceHasConcept() {
    return !!this.model.publicService.concept.id;
  }

  get isConceptLanguageVersionGenerated() {
    return this.model.languageVersionOfConcept.includes('generated');
  }

  get isNewlyCreatedPublicService() {
    const dateCreated = this.model.publicService.dateCreated.toString();
    const dateModified = this.model.publicService.dateModified.toString();
    return dateCreated === dateModified;
  }

  @action
  showUnlinkWarning() {
    this.shouldShowUnlinkWarning = true;
  }

  @action
  hideUnlinkWarning() {
    this.shouldShowUnlinkWarning = false;
  }

  unlinkConcept = dropTask(async () => {
    const { publicService } = this.model;
    await this.publicServiceService.unlinkConcept(publicService);
    this.hideUnlinkWarning();
  });

  hasUnsavedChangesObserver(aValue) {
    this.formHasUnsavedChanges = aValue;
  }
}
