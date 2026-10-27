/* eslint-disable warp-drive/no-legacy-request-patterns */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { trackedArray } from '@ember/reactive/collections';
import { removeItem } from 'frontend-lpdc/utils/array';
import { eq } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import { get, fn } from '@ember/helper';
import TableLoader from './table-loader';
import SidebarContainer from './sidebar-container';
import RemoteUrlEntry from './remote-url-entry';
import { formatDate } from 'ember-intl';
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

export default class DecisionLinkingModalComponent extends Component {
  @tracked currentStep = 1;
  @tracked linkedDecisions;
  @tracked isUploadingFiles = false;
  @tracked remoteUrls = [];
  @tracked remoteUrlsHaveErrors = false;
  @tracked publicService;
  @tracked uploadedFiles = new trackedArray([]);

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
    this.uploadedFiles = new trackedArray([]);

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

  <template>
    <AuModal
      @modalOpen={{true}}
      @closeModal={{this.close}}
      @padding="none"
      @size="large"
      @title={{if
        (eq this.currentStep 1)
        "Relevante besluiten koppelen"
        "Eigen document(en) toevoegen"
      }}
      as |Modal|
    >
      <Modal.Body>
        {{#if (eq this.currentStep 1)}}
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
                    {{on
                      "input"
                      (perform this.searchTask value="target.value")
                    }}
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
                    {{on "click" this.addDocument}}
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
                            @checked={{get this.linkedDecisions decision.id}}
                            @onChange={{fn
                              this.handleDecisionCheckbox
                              decision
                            }}
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
                      Staat je document er nie bij?
                      <AuButton
                        @skin="link"
                        {{on "click" this.addDocument}}
                      >Voeg je eigen URL of document toe</AuButton>
                    </td>
                  </tr>
                </Table.content>
              </AuDataTable>
            </:content>
          </SidebarContainer>
        {{else if (eq this.currentStep 2)}}
          <div class="au-o-box--small">
            <AuButton
              @skin="link"
              @icon="arrow-left"
              {{on "click" this.goToPreviousStep}}
            >terug naar Relevante besluiten koppelen</AuButton>

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
        {{/if}}
      </Modal.Body>
      <Modal.Footer>
        <AuButtonGroup class="au-u-flex--row-reverse">
          {{#if (eq this.currentStep 1)}}
            <AuButton {{on "click" this.linkDecision}}>
              Koppelen
            </AuButton>
            <AuButton @skin="secondary" {{on "click" this.close}}>
              Annuleren
            </AuButton>
          {{else if (eq this.currentStep 2)}}
            <AuButton
              {{on "click" this.saveDecision}}
              @disabled={{this.isSaveDisabled}}
            >
              Toevoegen
            </AuButton>
            <AuButton @skin="secondary" {{on "click" this.close}}>
              Annuleren
            </AuButton>
          {{/if}}
        </AuButtonGroup>
      </Modal.Footer>
    </AuModal>
  </template>
}
