import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { trackedArray } from '@ember/reactive/collections';
import { removeItem } from 'frontend-lpdc/utils/array';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import { get, fn } from '@ember/helper';
import TableLoader from './table-loader';
import SidebarContainer from './sidebar-container';
import RemoteUrlEntry from './remote-url-entry';
import { formatDate } from 'ember-intl';
import { JOB_STATUS } from 'frontend-lpdc/models/job';
import { waitForDownload } from 'frontend-lpdc/utils/wait-for-download';
import { STATUS } from 'frontend-lpdc/models/remote-data-object';
import { task, timeout } from 'ember-concurrency';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import AuCheckbox from '@appuniversum/ember-appuniversum/components/au-checkbox';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import AuFileCard from '@appuniversum/ember-appuniversum/components/au-file-card';
import AuFileUpload from '@appuniversum/ember-appuniversum/components/au-file-upload';

class LinkDecisionStep extends Component {
  @action
  linkDecisions() {
    // TODO: implement once the model is ready: link the selected decisions to the instance, remove previous decisions
    this.args.onClose();
  }

  <template>
    <AuModal
      @modalOpen={{true}}
      @closeModal={{@onClose}}
      @padding="none"
      @size="large"
      @title="Relevante besluiten koppelen"
      as |Modal|
    >
      <Modal.Body>
        {{! TODO: finish the filtering and table }}
        <SidebarContainer @scroll={{true}}>
          <:sidebar>
            <div class="au-o-box au-o-box--small au-o-flow">
              <div>
                <AuHeading
                  @level="2"
                  @skin="4"
                  class="au-u-margin-bottom-small"
                >Filters</AuHeading>
                <AuLabel for="search">Zoek op titel of trefwoord</AuLabel>
                <input
                  value={{this.search}}
                  id="search"
                  class="au-c-input au-c-input--block"
                  {{on "input" (perform this.searchTask value="target.value")}}
                />
              </div>
              {{#if this.hasActiveFilters}}
                <div class="au-u-text-left@medium">
                  <AuButton
                    @icon="cross"
                    @skin="secondary"
                    {{on "click" this.resetFilters}}
                  >
                    Wis filters
                  </AuButton>
                </div>
              {{/if}}
            </div>
          </:sidebar>
          <:content>
            <AuToolbar @size="medium" as |Group|>
              <Group>
                <AuButtonGroup @inline="true">
                  {{! TODO: switch the primary between the selected option, add count after geselecteerd }}
                  <AuButton @skin="primary">Alle documenten</AuButton>
                  <AuButton @skin="secondary">Geselecteerd (x)</AuButton>
                </AuButtonGroup>
              </Group>
              <Group class="au-u-flex au-u-flex--vertical-center">
                <AuButton
                  @skin="primary"
                  @icon="link"
                  {{on "click" @onAddDocument}}
                >Eigen document toevoegen</AuButton>
              </Group>
            </AuToolbar>
            <AuDataTable
              @content={{this.publicServices}}
              @sort={{this.sort}}
              @page={{this.page}}
              @size={{20}}
              @showPaginationBoundaryLinks={{true}}
              as |Table|
            >
              <Table.content as |Content|>
                <Content.header>
                  <th class="au-u-padding-left-small">
                    <AuCheckbox
                      @checked={{this.allVisibleInstancesSubscribed}}
                      @onChange={{this.subscribeAllInstances}}
                    />
                  </th>
                  <th>
                    Documenttitel
                  </th>
                  <th>
                    PublicatieDatum
                  </th>
                  <th>
                    Bestuursorgaan
                  </th>
                  <th>
                    Besluittype
                  </th>
                  <th>
                    Bijlagen
                  </th>
                  <th>
                    Publicatiekanaal
                  </th>
                  <th>
                    Bekijk
                  </th>
                </Content.header>

                {{#if this.showTableLoader}}
                  <TableLoader />
                {{else if this.hasErrored}}
                  <tr>
                    <td colspan="100%" class="au-c-data-table__message">
                      <AuAlert
                        @title="Er ging iets fout bij het opvragen van de producten en diensten."
                        @icon="info-circle"
                        @skin="error"
                        @size="small"
                        class="au-u-margin-bottom-none"
                      />
                    </td>
                  </tr>
                {{else if this.hasResults}}
                  <Content.body as |decision|>
                    {{#if this.notificationService.isNotificationsEnabled}}
                      <td>
                        <AuCheckbox
                          @checked={{get @linkedDecisions decision.id}}
                          {{!-- @onChange={{fn this.handleDecisionCheckbox decision}} --}}
                        />
                      </td>
                    {{/if}}
                    <td>
                      {{decision.title}}
                    </td>
                    <td>
                      {{formatDate decision.publishDate}}
                    </td>
                    <td>
                    </td>
                    <td>
                    </td>
                    <td>
                    </td>
                    <td>
                      <AuButton @skin="link" @icon="eye">Bekijk</AuButton>
                    </td>
                  </Content.body>
                {{/if}}
                <tr>
                  <td colspan="100%" class="au-u-text-center">
                    Staat je document er niet bij?
                    <AuButton @skin="link" {{on "click" @onAddDocument}}>Voeg je
                      eigen URL of document toe</AuButton>
                  </td>
                </tr>
              </Table.content>
            </AuDataTable>
          </:content>
        </SidebarContainer>
      </Modal.Body>
      <Modal.Footer>
        <AuButtonGroup class="au-u-flex--row-reverse">
          <AuButton {{on "click" this.linkDecisions}}>
            Koppelen
          </AuButton>
          <AuButton @skin="secondary" {{on "click" @onClose}}>
            Annuleren
          </AuButton>
        </AuButtonGroup>
      </Modal.Footer>
    </AuModal>
  </template>
}

class UploadDecisionStep extends Component {
  @tracked isUploadingFiles = false;
  @tracked remoteUrls = [];
  @tracked remoteUrlsHaveErrors = false;
  @tracked uploadedFiles = trackedArray([]);
  @service store;
  @service toaster;
  @service currentSession;

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
    return (
      this.isUploadingFiles ||
      this.remoteUrlsHaveErrors ||
      (this.remoteUrls.length < 1 && this.uploadedFiles.length < 1)
    );
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
  async saveDecision() {
    // Send this.uploadedFiles and this.remoteUrls to the backend, start the processing job
    console.log('URLs to be processed:', this.remoteUrls);
    console.log('Files to be processed', this.uploadedFiles);
    const now = new Date();

    const remoteUrls = await Promise.all(
      this.remoteUrls.map((url) =>
        this.store
          .createRecord('remote-data-object', {
            source: url,
            status: STATUS.READY,
            created: now,
            modified: now,
            creator: this.currentSession.group.uri,
          })
          .save(),
      ),
    );
    const results = await Promise.allSettled(remoteUrls.map(waitForDownload));
    const failed = remoteUrls.filter(
      (_, i) => results[i].status === 'rejected',
    );

    if (failed.length) {
      this.failedUrls = failed.map((remoteUrl) => remoteUrl.source);
      this.toaster.error(
        "niet alle URL's konden worden opgehaald. Controleer de gemarkeerde URL's.",
        'Download mislukt',
      );
      return; // don't start a job with missing files, the user can fix the urls
    }

    const downloadedFiles = results.map((result) => result.value);
    const files = [...this.uploadedFiles, ...downloadedFiles];
    const scheduledJob = this.store.createRecord('job', {
      status: JOB_STATUS.SCHEDULED, // TODO: which status, ticket mentions busy?
      operation:
        'http://lblod.data.gift/id/jobs/concept/JobOperation/convertDocumentToHtml',
      creator: this.currentSession.group.uri, // TODO: store the user or the bestuurseenheid as the creator of the job
      created: now,
      modified: now,
    });
    await scheduledJob.save();

    // Create a sourceDocument object for each file/url, a downloaded file only has a generated name so use the url as title
    const sourceDocuments = [
      ...this.uploadedFiles.map((file) => ({ title: file.filename, file })),
      ...remoteUrls.map((remoteDataObject, i) => ({
        title: remoteDataObject.source,
        file: downloadedFiles[i],
      })),
    ];
    await Promise.all(
      sourceDocuments.map((sourceDocument) =>
        this.store.createRecord('source-document', sourceDocument).save(),
      ),
    );

    const inputContainer = this.store.createRecord('data-container', {
      files,
    });
    await inputContainer.save();

    const task = this.store.createRecord('task', {
      status: JOB_STATUS.SCHEDULED,
      operation:
        'http://lblod.data.gift/id/jobs/concept/TaskOperation/documentToHtml',
      index: '0',
      created: now,
      modified: now,
      job: scheduledJob,
      inputContainers: [inputContainer],
    });
    await task.save();
    console.log('created the job and task', scheduledJob, task);

    // clear the files that are used for the job so unused ones get cleaned up from the server
    this.uploadedFiles = trackedArray([]);

    this.args.onSaved(scheduledJob); // returns to the overview and polls the job
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
  <template>
    <AuModal
      @modalOpen={{true}}
      @closeModal={{@onClose}}
      @padding="none"
      @size="large"
      @title="Eigen document(en) toevoegen"
      as |Modal|
    >
      <Modal.Body>
        <div class="au-o-box--small">
          <AuButton @skin="link" @icon="arrow-left" {{on "click" @onBack}}>terug
            naar Relevante besluiten koppelen</AuButton>

          <div
            class="au-o-layout au-o-layout--small au-o-flow au-u-padding-top"
          >
            <div>
              <AuLabel for="decision-url">
                URL
              </AuLabel>
              <RemoteUrlEntry
                id="decision-url"
                @onChange={{this.handleRemoteUrlChange}}
              />
            </div>

            <div>
              <AuLabel for="decision-attachment">
                Voeg document(en) toe (*.doc, *.pdf)
              </AuLabel>
              {{#each this.uploadedFiles as |file|}}
                <AuFileCard
                  class="au-u-margin-bottom-small"
                  @filename={{file.filename}}
                  @fileSize={{file.humanReadableSize}}
                  @onDelete={{fn this.deleteFile file}}
                />
              {{/each}}
              <AuFileUpload
                id="decision-attachment"
                @accept=".doc,.pdf"
                @maxFileSizeMB={{1024}}
                @multiple={{true}}
                @onUpload={{this.uploadFile}}
                @onQueueUpdate={{this.handleQueueUpdate}}
              />
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <AuButtonGroup class="au-u-flex--row-reverse">
          <AuButton
            {{on "click" this.saveDecision}}
            @disabled={{this.isSaveDisabled}}
          >
            Toevoegen
          </AuButton>
          <AuButton @skin="secondary" {{on "click" @onClose}}>
            Annuleren
          </AuButton>
        </AuButtonGroup>
      </Modal.Footer>
    </AuModal>
  </template>
}

export default class DecisionLinkingModalComponent extends Component {
  @tracked isAddingDocument = false;
  @tracked linkedDecisions;
  @tracked publicService;
  @service toaster;

  constructor() {
    super(...arguments);
    this.publicService = this.args.data.publicService;
    this.linkedDecisions = this.publicService.linkedDecisions;
  }

  @action
  showAddDocument() {
    this.isAddingDocument = true;
  }

  @action
  showLinkDecisions() {
    this.isAddingDocument = false;
  }

  @action
  handleDocumentAdded(job) {
    this.pollJob.perform(job);
    this.showLinkDecisions();
  }

  pollJob = task(async (job) => {
    const loadingToast = this.toaster.loading(
      'Je besluit wordt verwerkt. Dit kan even duren.',
      'Besluit upload',
    );

    try {
      do {
        await timeout(1000);
        await job.reload();
      } while (
        job.status === JOB_STATUS.BUSY ||
        job.status === JOB_STATUS.SCHEDULED
      );

      if (job.status === JOB_STATUS.SUCCESS) {
        this.toaster.success(
          'Het besluit is succesvol verwerkt en is beschikbaar in de tabel',
          'Besluit upload',
          { timeOut: 5000 },
        );
        // TODO: reload the decisions in the table so the new one shows up
        return;
      } else if (job.status === JOB_STATUS.FAILED) {
        this.toaster.error(
          'Het verwerken van het besluit is mislukt, gelieve opnieuw te proberen',
          'Besluit upload',
        );
        return;
      }
    } finally {
      this.toaster.close(loadingToast);
    }
  });

  <template>
    {{#if this.isAddingDocument}}
      <UploadDecisionStep
        @onBack={{this.showLinkDecisions}}
        @onSaved={{this.handleDocumentAdded}}
        @onClose={{@close}}
      />
    {{else}}
      <LinkDecisionStep
        @linkedDecisions={{this.linkedDecisions}}
        @onAddDocument={{this.showAddDocument}}
        @onClose={{@close}}
      />
    {{/if}}
  </template>
}
