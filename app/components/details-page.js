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
import ConfirmDeletionModal from 'frontend-lpdc/components/confirm-deletion-modal';
import ConfirmReopeningModal from 'frontend-lpdc/components/confirm-reopening-modal';
import ConfirmSubmitModal from 'frontend-lpdc/components/confirm-submit-modal';
import UnsavedChangesModal from 'frontend-lpdc/components/unsaved-changes-modal';
import { FORM, RDF } from 'frontend-lpdc/rdf/namespaces';
import ConfirmBijgewerktTotModal from 'frontend-lpdc/components/confirm-bijgewerkt-tot-modal';

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

  @tracked hasUnsavedChanges = false;
  @tracked forceShowErrors = false;
  @tracked form;

  id = guidFor(this);
  @tracked formStore;
  graphs = FORM_GRAPHS;

  constructor() {
    super(...arguments);
    this.loadForm.perform();
    this.sourceNode = new NamedNode(this.args.publicService.uri);

    if (!this.args.readOnly) {
      this.router.on('routeWillChange', this, this.showUnsavedChangesModal);
    }
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

  @task
  *loadForm() {
    const {
      form: formTtl,
      meta: metaTtl,
      source: sourceTtl,
    } = yield this.publicServiceService.getPublicServiceForm(
      this.args.publicService.uri,
      this.args.formId
    );

    let formStore = new ForkingStore();
    formStore.parse(formTtl, FORM_GRAPHS.formGraph, 'text/turtle');
    formStore.parse(metaTtl, FORM_GRAPHS.metaGraph, 'text/turtle');
    formStore.parse(sourceTtl, FORM_GRAPHS.sourceGraph, 'text/turtle');

    let form = formStore.any(
      undefined,
      RDF('type'),
      FORM('Form'),
      FORM_GRAPHS.formGraph
    );

    if (!this.args.readOnly) {
      formStore.registerObserver(this.updateFormDirtyState, this.id);
    }

    this.form = form;
    this.formStore = formStore;
    this.hasUnsavedChanges = false;
  }

  @action
  updateFormDirtyState(/* delta */) {
    // TODO: we can probably make this logic smarter so that reverting to the original saved state doesn't trigger a false positive
    this.hasUnsavedChanges = true;
  }

  @dropTaskGroup publicServiceAction;

  @task({ group: 'publicServiceAction' })
  *publishPublicService() {
    const { publicService } = this.args;
    const validationErrors = yield this.publicServiceService.validateInstance(
      publicService
    );

    if (validationErrors.length > 0) {
      for (const validationError of validationErrors) {
        this.toaster.error(validationError.message, 'Fout', { timeOut: 30000 });
      }
    } else {
      yield this.publicServiceService.publishInstance(publicService);

      this.router.transitionTo('public-services');
    }
  }

  @task({ group: 'publicServiceAction' })
  *handleFormSubmit(event) {
    event?.preventDefault?.();
    yield this.saveSemanticForm.unlinked().perform();

    if (this.args.publicService.reviewStatus) {
      yield this.modals.open(ConfirmBijgewerktTotModal, {
        confirmBijgewerktTotHandler: async () => {
          await this.publicServiceService.confirmBijgewerktTotLatestFunctionalChange(
            this.args.publicService
          );
        },
      });
    }
  }

  @dropTask
  *saveSemanticForm() {
    let { publicService } = this.args;
    let serializedData = this.formStore.serializeDataWithAddAndDelGraph(
      this.graphs.sourceGraph,
      'application/n-triples'
    );

    yield this.publicServiceService.updatePublicService(
      publicService,
      serializedData
    );
    yield this.publicServiceService.loadPublicServiceDetails(publicService.id);
    yield this.loadForm.perform();
  }

  @dropTask
  *requestSubmitConfirmation() {
    let isValidForm = validateForm(this.form, {
      ...this.graphs,
      sourceNode: this.sourceNode,
      store: this.formStore,
    });
    this.forceShowErrors = !isValidForm;

    if (this.hasUnsavedChanges) {
      yield this.saveSemanticForm.unlinked().perform();
    }

    if (isValidForm) {
      if (this.args.publicService.reviewStatus) {
        yield this.modals.open(ConfirmBijgewerktTotModal, {
          confirmBijgewerktTotHandler: async () => {
            await this.publicServiceService.confirmBijgewerktTotLatestFunctionalChange(
              this.args.publicService
            );
          },
        });
      }

      yield this.modals.open(ConfirmSubmitModal, {
        submitHandler: async () => {
          await this.publishPublicService.perform();
        },
      });
    } else {
      this.toaster.error('Formulier is ongeldig', 'Fout', { timeOut: 30000 });
    }
  }

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
          this.args.publicService.uri
        );
        this.hasUnsavedChanges = false;
        this.router.replaceWith('public-services');
      },
    });
  }

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
        }
      );

      if (this.args.publicService.reviewStatus && saved) {
        await this.modals.open(ConfirmBijgewerktTotModal, {
          confirmBijgewerktTotHandler: async () => {
            await this.publicServiceService.confirmBijgewerktTotLatestFunctionalChange(
              this.args.publicService
            );
          },
        });
      }

      if (shouldTransition) {
        this.hasUnsavedChanges = false;
        transition.retry();
      }
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
