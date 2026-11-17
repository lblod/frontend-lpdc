import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency';
import { FEEDBACK_STATUS } from 'frontend-lpdc/models/feedback';
import { hasConcept } from 'frontend-lpdc/models/public-service';
import { service } from '@ember/service';
import DecisionLinkingModalComponent from 'frontend-lpdc/components/decision-linking-modal';

export default class PublicServicesDetailsController extends Controller {
  @service store;
  @service modals;
  @service('public-service') publicServiceService;
  @service router;
  @service contextService;

  @tracked shouldShowUnlinkWarning = false;
  @tracked formHasUnsavedChanges = false;
  @tracked isDecisionViewOpen = false;
  @tracked feedbackSidebarExpanded = false;
  @tracked hasFeedback = false;
  @tracked includeFeedbackHistory = true;

  constructor() {
    super(...arguments);
    this.contextService.addParentContext(this);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.contextService.removeParentContext(this);
  }

  get linkedDecisions() {
    return this.model.publicService.hasMany('sourceDocuments').value();
  }

  get isFeedbackOpen() {
    // an open decisions view minimizes the feedback
    return this.feedbackSidebarExpanded && !this.isDecisionViewOpen;
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

  @action
  linkDecision() {
    this.modals.open(DecisionLinkingModalComponent, {
      publicService: this.model.publicService,
    });
  }

  @action
  openDecisionView() {
    this.isDecisionViewOpen = true;
  }

  @action
  closeDecisionView() {
    this.feedbackSidebarExpanded = false;
    this.isDecisionViewOpen = false;
  }

  @action
  toggleFeedbackSidebar() {
    this.feedbackSidebarExpanded = !this.isFeedbackOpen;
    if (this.feedbackSidebarExpanded) {
      this.isDecisionViewOpen = false;
    }
  }

  @action
  toggleIncludeFeedbackHistory() {
    this.includeFeedbackHistory = !this.includeFeedbackHistory;
    this.loadFeedback.perform();
  }

  resetSidebar() {
    const { feedbackAvailable } = this.model.publicService;

    this.isDecisionViewOpen = false;
    this.feedbackSidebarExpanded = feedbackAvailable;
    this.hasFeedback = feedbackAvailable;
    this.includeFeedbackHistory = true;
    this.loadFeedback.perform();
  }

  loadFeedback = restartableTask(async () => {
    const result = await this.store.query('feedback', {
      'filter[instance][:uri:]': this.model.publicService.uri,
      include:
        'question,question.from,question.to,answer,answer.from,answer.to,receiver-bestuurseenheid',
      sort: '-created-at',
      page: { size: 1000 }, //TODO: refactor to use pagination if needed
    });
    // Filter out feedback that are 'ingetrokken' from IPDC
    const allFeedback = result.filter(
      (f) =>
        f.ipdcStatus !==
        'https://ipdc.vlaanderen.be/ns/FeedbackStatus#INGETROKKEN',
    );
    this.hasFeedback = allFeedback.length > 0;

    if (this.includeFeedbackHistory) return allFeedback;

    return allFeedback.filter((feedback) => {
      return (
        feedback.status !== FEEDBACK_STATUS.VERWERKT &&
        feedback.status !== FEEDBACK_STATUS.VERZONDEN
      );
    });
  });

  getPublicService() {
    return this.model.publicService;
  }
}
