import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedArray } from 'tracked-built-ins';
import { removeItem } from 'frontend-lpdc/utils/array';

export default class DecisionLinkingModalComponent extends Component {
  @tracked currentStep = 2;
  @tracked linkedDecisions;
  @tracked isUploadingFiles = false;
  @tracked remoteUrls = [];
  @tracked remoteUrlsHaveErrors = false;
  @tracked publicService;
  @tracked uploadedFiles = new TrackedArray([]);

  @service store;
  @service toaster;

  constructor() {
    super(...arguments);
    this.publicService = this.args.data.publicService;
    this.linkedDecisions = this.publicService.linkedDecisions;
  }
  @action
  close() {
    this.args.close();
  }

  @action
  linkDecision() {
    // link the selected decisions to the instance, remove previous
    this.close();
  }

  @action
  addDocument() {
    this.currentStep = 2;
  }

  @action
  goToPreviousStep() {
    this.currentStep = 1;
  }

  @action
  handleDecisionCheckbox(value) {
    this.linkedDecisions = value;
  }

  @action
  async uploadFile({ fileId }) {
    const file = await this.store.findRecord('file', fileId);
    this.uploadedFiles.push(file);
  }

  @action
  handleRemoteUrlChange({ urls, hasErrors }) {
    this.remoteUrls = urls;
    this.remoteUrlsHaveErrors = hasErrors;
  }

  get isSaveDisabled() {
    return this.isUploadingFiles || this.remoteUrlsHaveErrors;
  }

  @action
  handleQueueUpdate(queueInfo) {
    this.isUploadingFiles = !queueInfo.isQueueEmpty;
  }

  @action
  async deleteFile(file) {
    await file.destroyRecord();
    removeItem(this.uploadedFiles, file);
  }

  @action
  saveDecision() {
    // Send this.uploadedFiles and this.remoteUrls to the backend, start the processing job
    console.log('URLs to be processed:', this.remoteUrls);
    console.log('Files to be processed', this.uploadedFiles);

    // clear the files that are used so unused get cleaned up from the server
    this.uploadedFiles = new TrackedArray([]);


    this.toaster.success('Besluit(en) zijn succesvol geupload.');
    // return to the overview when it's added
    this.goToPreviousStep();
  }

  // Cleanup any files that are not used
  willDestroy() {
    super.willDestroy();
    // whatever is still in the list was never confirmed → not used → delete
    for (const file of this.uploadedFiles) {
      file.destroyRecord().catch(() => {
        // best-effort cleanup; the modal is gone, nothing to show
      });
    }
  }
}
