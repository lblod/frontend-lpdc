import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { gte, equal } from '@ember/object/computed';
import { and, not } from 'ember-awesome-macros';
import { documentStatusVerstuurdId } from '../../models/document-status';
import { A } from '@ember/array';

export default Component.extend({
  classNames: ['col--4-12 col--9-12--m col--12-12--s container-flex--contain'],
  router: service(),
  store: service(),
  currentSession: service(),
  readyForTmpSave: gte('reportFiles.length', 1),
  readyToSend: equal('reportFiles.length', 2),
  enableUpload: and('report.status.isConcept', not('readyToSend')),

  reportFiles: null,

  async didReceiveAttrs(){
    this.set('reportFiles', await this.get('report.files').toArray() || A());
  },

  async updateReport() {
    const currentUser = await this.get('currentSession.user');
    this.report.set('files', this.get('reportFiles'));
    this.report.set('lastModifier', currentUser);
    this.report.set('modified', new Date());
    return this.report.save();
  },

  async deleteReport(){
    const files = await this.report.files;
    files.forEach(file => file.destroyRecord());
    this.report.destroyRecord();
  },

  actions: {
    async send() {
      const statusSent = await this.store.findRecord('document-status', documentStatusVerstuurdId);
      this.report.set('status', statusSent);
      await this.updateReport();
      this.get('router').transitionTo('bbcdr.rapporten.index');
    },

    async deleteReport() {
      await this.deleteReport();
      this.get('router').transitionTo('bbcdr.rapporten.index');
    },

    async tempSave(){
      await this.updateReport();
      this.get('router').transitionTo('bbcdr.rapporten.edit', this.report.get('id'));
    },

    async addFile(file) {
      this.reportFiles.pushObject(file);
    },

    async deleteFile(file) {
      this.reportFiles.removeObject(file);
    },

    async close(){
      if(this.isNewReport)
        await this.deleteReport();
      this.get('router').transitionTo('bbcdr.rapporten.index');
    }
  }
});