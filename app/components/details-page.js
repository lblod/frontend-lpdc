import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import {
  ForkingStore,
  validateForm,
} from '@lblod/ember-submission-form-fields';
import { NamedNode } from 'rdflib';
import { dropTask, dropTaskGroup, task } from 'ember-concurrency';
import ConfirmCopyModal from 'frontend-lpdc/components/confirm-copy-modal';
import ConfirmDeletionModal from 'frontend-lpdc/components/confirm-deletion-modal';
import ConfirmReopeningModal from 'frontend-lpdc/components/confirm-reopening-modal';
import ConfirmSubmitModal from 'frontend-lpdc/components/confirm-submit-modal';
import UnsavedChangesModal from 'frontend-lpdc/components/unsaved-changes-modal';
import { FORM, RDF } from 'frontend-lpdc/rdf/namespaces';
import ConfirmUpToDateTillModal from 'frontend-lpdc/components/confirm-up-to-date-till-modal';
import getUUIDFromUri from 'frontend-lpdc/helpers/get-uuid-from-uri';
import ENV from 'frontend-lpdc/config/environment';
import { isConceptUpdated } from 'frontend-lpdc/models/public-service';
import FullyTakeConceptSnapshotOverModalComponent from 'frontend-lpdc/components/fully-take-concept-snapshot-over';
import ConfirmConvertToInformalModalComponent from 'frontend-lpdc/components/confirm-convert-to-informal-modal';
import isFeatureEnabled from 'frontend-lpdc/helpers/is-feature-enabled';
import { FEEDBACK_STATUS } from 'frontend-lpdc/models/feedback';

const FORM_GRAPHS = {
  formGraph: new NamedNode('http://data.lblod.info/form'),
  metaGraph: new NamedNode('http://data.lblod.info/metagraph'),
  sourceGraph: new NamedNode(`http://data.lblod.info/sourcegraph`),
};

export default class DetailsPageComponent extends Component {
  @service modals;
  @service router;
  @service store;
  @service toaster;
  @service('public-service') publicServiceService;
  @service contextService;

  @tracked hasValidationErrors = false;
  @tracked hasUnsavedChanges = false;
  @tracked forceShowErrors = false;
  @tracked form;
  @tracked includeFeedbackHistory = true;
  @tracked feedbackSidebarExpanded = this.feedbackAvailable;
  id = guidFor(this);
  @tracked formStore;
  graphs = FORM_GRAPHS;

  constructor() {
    super(...arguments);
    this.loadForm.perform();
    this.loadFeedback.perform();
    this.sourceNode = new NamedNode(this.args.publicService.uri);

    if (!this.args.readOnly) {
      this.router.on('routeWillChange', this, this.showUnsavedChangesModal);
    }
  }

  @action
  toggleFeedbackSidebar() {
    this.feedbackSidebarExpanded = !this.feedbackSidebarExpanded;
  }

  @action
  toggleIncludeFeedbackHistory() {
    this.includeFeedbackHistory = !this.includeFeedbackHistory;
    this.loadFeedback.perform();
  }

  #showToasterErrorMessage(message) {
    this.toaster.error(message, 'Fout', { timeOut: 30000 });
  }

  get isStatusVerzondenAndPublished() {
    return this.args.isPublished && this.args.publicService.isSent;
  }

  get isConceptUpdatedStatus() {
    return isConceptUpdated(this.args.publicService.reviewStatus);
  }

  get functionallyChangedFields() {
    return this.args.functionallyChangedFields.join(', ');
  }

  get isInitialized() {
    return this.loadForm.last.isSuccessful;
  }

  get canSubmit() {
    return this.isInitialized && this.publicServiceAction.isIdle;
  }

  get canSave() {
    return (
      this.isInitialized &&
      this.hasUnsavedChanges &&
      this.publicServiceAction.isIdle
    );
  }

  get ipdcEnLink() {
    const instanceId = getUUIDFromUri(this.args.publicService.uri);
    return `${ENV.ipdcUrl}/en/instantie/${instanceId}`;
  }

  get shouldDisplayEnLinkToIpdc() {
    return (
      this.args.publicService.isYourEurope && this.isStatusVerzondenAndPublished
    );
  }

  get shouldDisplayReadonlyEnLinkToIpdc() {
    return (
      this.args.publicService.isYourEurope &&
      !this.isStatusVerzondenAndPublished
    );
  }

  get ipdcConceptCompareLink() {
    const productId = this.args.publicService.concept.get('productId');
    const languageVersion =
      this.args.publicService.dutchLanguageVariant.toLowerCase() ===
      'nl-be-x-informal'
        ? 'nl/informeel'
        : 'nl';

    const latestSnapshot = getUUIDFromUri(
      this.args.publicService.concept.get('hasLatestFunctionalChange'),
    );
    const publicServiceSnapshot = getUUIDFromUri(
      this.args.publicService.versionedSource,
    );
    return `${ENV.ipdcUrl}/${languageVersion}/concept/${productId}/revisie/vergelijk?revisie1=${publicServiceSnapshot}&revisie2=${latestSnapshot}`;
  }

  get shouldDisplayProductVerwijderenButton() {
    return this.publicServiceAction.isRunning || this.args.readOnly;
  }

  get shouldShowConversionAlertPublishedInstance() {
    const { publicService, formalInformalChoice } = this.args;
    return (
      publicService.needsConversionFromFormalToInformal &&
      this.isStatusVerzondenAndPublished &&
      formalInformalChoice.chosenForm === 'informal'
    );
  }

  get ipdcInformalLink() {
    const instanceId = getUUIDFromUri(this.args.publicService.uri);
    return `${ENV.ipdcUrl}/nl/informeel/instantie/${instanceId}`;
  }

  get shouldShowConversionAlertDraftInstance() {
    const { publicService, formalInformalChoice } = this.args;
    return (
      publicService.needsConversionFromFormalToInformal &&
      !this.isStatusVerzondenAndPublished &&
      formalInformalChoice.chosenForm === 'informal'
    );
  }

  get feedbackAvailable() {
    return this.args.publicService.feedbackAvailable;
  }

  loadForm = task(async () => {
    const {
      form: formTtl,
      meta: metaTtl,
      source: sourceTtl,
    } = await this.publicServiceService.getPublicServiceForm(
      this.args.publicService,
      this.args.formId,
    );

    let formStore = new ForkingStore();
    formStore.parse(formTtl, FORM_GRAPHS.formGraph, 'text/turtle');
    formStore.parse(metaTtl, FORM_GRAPHS.metaGraph, 'text/turtle');
    formStore.parse(sourceTtl, FORM_GRAPHS.sourceGraph, 'text/turtle');

    let form = formStore.any(
      undefined,
      RDF('type'),
      FORM('Form'),
      FORM_GRAPHS.formGraph,
    );

    if (!this.args.readOnly) {
      formStore.registerObserver(this.updateFormDirtyState, this.id);
    }

    this.form = form;
    this.formStore = formStore;
    this.updateHasUnsavedChanges(false);
  });

  loadFeedback = task(async () => {
    const allFeedback = await this.store.query('feedback', {
      'filter[instance][:uri:]': this.args.publicService.uri,
      include: 'question,answer',
      sort: '-created-at',
    });

    if (this.includeFeedbackHistory) return allFeedback;

    return allFeedback.filter(
      (feedback) => feedback.status !== FEEDBACK_STATUS.VERWERKT,
    );
  });

  @action
  updateFormDirtyState(/* delta */) {
    this.updateHasUnsavedChanges(true);
  }

  updateHasUnsavedChanges(aValue) {
    this.hasUnsavedChanges = aValue;

    this.contextService
      .findParentContextWithContract('hasUnsavedChangesObserver')
      ?.hasUnsavedChangesObserver(this.hasUnsavedChanges);
  }

  @dropTaskGroup publicServiceAction;

  publishPublicService = task({ group: 'publicServiceAction' }, async () => {
    // NOTE (10/04/2025): Before calling this the `publicService` should have
    // been validated using `this.publicServiceService.validateInstance`,
    // otherwise incorrect product instances can be published.
    const { publicService } = this.args;
    await this.publicServiceService.publishInstance(publicService);

    this.router.transitionTo('public-services');
  });

  handleFormSubmit = task({ group: 'publicServiceAction' }, async (event) => {
    event?.preventDefault?.();
    await this.saveSemanticForm.unlinked().perform();

    if (this.args.publicService.reviewStatus) {
      await this.modals.open(ConfirmUpToDateTillModal, {
        confirmUpToDateTillHandler: async () => {
          await this.publicServiceService.confirmUpToDateTillLatestFunctionalChange(
            this.args.publicService,
          );
        },
      });
    }
  });

  saveSemanticForm = dropTask(async () => {
    let { publicService } = this.args;
    let serializedData = this.formStore.serializeDataWithAddAndDelGraph(
      this.graphs.sourceGraph,
      'application/n-triples',
    );

    await this.publicServiceService.updatePublicService(
      publicService,
      serializedData,
    );
    await this.publicServiceService.loadPublicServiceDetails(publicService.id);
    await this.loadForm.perform();
  });

  requestSubmitConfirmation = dropTask(async () => {
    let isValidForm = await validateForm(this.form, {
      ...this.graphs,
      sourceNode: this.sourceNode,
      store: this.formStore,
    });
    this.forceShowErrors = !isValidForm;

    // Save this form first
    if (this.hasUnsavedChanges) {
      await this.saveSemanticForm.unlinked().perform();
    }

    if (isValidForm) {
      // NOTE (10/04/2025): These checks should be done after the form is
      // validated. Otherwise, the user gets duplicate error messages when the
      // currently open form contains an error. One message from the `else`
      // block below and one from `validateInstance`.
      const publishErrors = await this.publicServiceService.validateInstance(
        this.args.publicService,
      );

      if (publishErrors.length === 0) {
        if (this.args.publicService.reviewStatus) {
          await this.modals.open(ConfirmUpToDateTillModal, {
            confirmUpToDateTillHandler: async () => {
              await this.publicServiceService.confirmUpToDateTillLatestFunctionalChange(
                this.args.publicService,
              );
            },
          });
        }

        await this.modals.open(ConfirmSubmitModal, {
          submitHandler: async () => {
            await this.publishPublicService.perform();
          },
        });
      } else {
        publishErrors.forEach((error) =>
          this.#showToasterErrorMessage(error.message),
        );
      }
    } else {
      this.#showToasterErrorMessage('Formulier is ongeldig');
    }
  });

  confirmInstanceAlreadyInformal = dropTask(async () => {
    const { publicService } = this.args;
    await this.publicServiceService.confirmInstanceAlreadyInformal(
      publicService,
    );
  });

  @action
  requestReopeningConfirmation() {
    this.modals.open(ConfirmReopeningModal, {
      reopeningHandler: async () => {
        let { publicService } = this.args;
        await this.publicServiceService.reopenPublicService(publicService);

        this.router.refresh('public-services.details');
      },
    });
  }

  @action
  removePublicService() {
    this.modals.open(ConfirmDeletionModal, {
      deleteHandler: async () => {
        await this.publicServiceService.deletePublicService(
          this.args.publicService.uri,
        );
        this.updateHasUnsavedChanges(false);
        this.router.replaceWith('public-services');
      },
    });
  }

  @action
  async copyPublicService() {
    if (isFeatureEnabled('fusies')) {
      await this.withinUnsavedChangesModal(() => {
        this.modals.open(ConfirmCopyModal, {
          copyHandler: async (forMunicipalityMerger) => {
            const copiedPublicServiceUuid =
              await this.publicServiceService.copyPublicService(
                this.args.publicService,
                forMunicipalityMerger,
              );
            this.toaster.success(
              'kopiëren gelukt',
              'Je kan nu de kopie bewerken.',
              { timeOut: 10000 },
            );
            this.router.transitionTo(
              'public-services.details',
              copiedPublicServiceUuid,
            );
          },
        });
      });
    } else {
      const copiedPublicServiceUuid =
        await this.publicServiceService.copyPublicService(
          this.args.publicService,
          false,
        );
      this.toaster.success('kopiëren gelukt', 'Je kan nu de kopie bewerken.', {
        timeOut: 10000,
      });
      this.router.transitionTo(
        'public-services.details',
        copiedPublicServiceUuid,
      );
    }
  }

  @action
  async fullyTakeConceptSnapshotOver() {
    await this.withinUnsavedChangesModal(() => {
      this.modals.open(FullyTakeConceptSnapshotOverModalComponent, {
        fullyTakeConceptSnapshotOverHandler: async () => {
          let { publicService } = this.args;
          await this.publicServiceService.fullyTakeConceptSnapshotOver(
            publicService,
          );
          this.router.refresh('public-services.details');
        },
        updateConceptSnapshotByFieldHandler: async () => {
          let { readOnly, publicService } = this.args;
          if (readOnly) {
            await this.publicServiceService.reopenPublicService(publicService);
            this.router.refresh('public-services.details');
          }
        },
      });
    });
  }

  @action
  convertToInformal() {
    this.modals.open(ConfirmConvertToInformalModalComponent, {
      convertToInformalHandler: async () => {
        let { publicService } = this.args;
        await this.publicServiceService.convertInstanceToInformal(
          publicService,
        );
        this.router.refresh('public-services.details');
      },
    });
  }

  markAsReviewed = dropTask(async () => {
    let { publicService } = this.args;
    await this.publicServiceService.confirmUpToDateTillLatestFunctionalChange(
      publicService,
    );
  });

  async showUnsavedChangesModal(transition) {
    if (transition.isAborted) {
      return;
    }

    if (this.hasUnsavedChanges) {
      transition.abort();

      const { shouldTransition, saved } = await this.modals.open(
        UnsavedChangesModal,
        {
          saveHandler: async () => {
            await this.saveSemanticForm.perform();
          },
        },
      );

      if (this.args.publicService.reviewStatus && saved) {
        await this.modals.open(ConfirmUpToDateTillModal, {
          confirmUpToDateTillHandler: async () => {
            await this.publicServiceService.confirmUpToDateTillLatestFunctionalChange(
              this.args.publicService,
            );
          },
        });
      }

      if (shouldTransition) {
        this.updateHasUnsavedChanges(false);
        transition.retry();
      }
    }
  }

  async withinUnsavedChangesModal(aFunctionToBeGuardedFromUnsavedChanges) {
    if (this.hasUnsavedChanges) {
      const { shouldTransition, saved } = await this.modals.open(
        UnsavedChangesModal,
        {
          saveHandler: async () => {
            await this.saveSemanticForm.perform();
          },
        },
      );

      if (shouldTransition) {
        if (!saved) {
          let { publicService } = this.args;
          await this.publicServiceService.loadPublicServiceDetails(
            publicService.id,
          );
          await this.loadForm.perform();
        }

        await aFunctionToBeGuardedFromUnsavedChanges();
      }
    } else {
      await aFunctionToBeGuardedFromUnsavedChanges();
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);

    if (!this.args.readOnly) {
      this.formStore?.deregisterObserver(this.id);
      this.router.off('routeWillChange', this, this.showUnsavedChangesModal);
    }
  }
}
