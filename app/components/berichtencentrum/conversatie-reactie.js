import { computed } from '@ember/object';
import { oneWay } from '@ember/object/computed';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { sort } from '@ember/object/computed';

export default Component.extend({
  router: service(),
  store: service(),
  currentSession: service(),

  onDateSorter: Object.freeze(['verzonden']),
  sortedMessages: sort('conversatie.berichten', 'onDateSorter'),

  init() {
    this._super(...arguments);
    this.initInputState();
  },

  didReceiveAttrs() {
    this._super(...arguments);
    this.initInputState();
    this.ensureOriginator();
  },

  // Initializes the input state so it appears the component was not
  // used before.
  initInputState(){
    this.setProperties({
      inhoud: '',
      bijlagen: A(),
      isExpanded: false});
  },

  canSend: computed('bijlagen', 'bijlagen.[]', function() {
    return this.bijlagen.length > 0;
  }),

  actions: {
    async verstuurBericht() {
      const bestuurseenheid   = await this.get('currentSession.group');
      const user              = await this.get('currentSession.user');
      
      try {
        this.collapse();
        let reactie = await this.get('store').createRecord('bericht', {
          inhoud                  : this.inhoud,
          aangekomen              : new Date(),
          verzonden               : new Date(),
          van                     : bestuurseenheid,
          auteur                  : user,
          naar                    : this.originator,
          bijlagen                : this.bijlagen
        });

        await reactie.save();
        this.conversatie.berichten.pushObject(reactie);
        this.conversatie.set('laatsteBericht', reactie);
        await this.conversatie.save();
      }
      catch (err) {
        alert (err.message);
      }
    },

    attachFile: function (file) {
      this.bijlagen.pushObject(file);
    },

    deleteFile: function (file) {
      this.bijlagen.removeObject(file);
    },

    expandMe: function() {
      this.expand();
    },

    collapseMe: function () {
      this.collapse();
    }
  },

  collapse: function() {
    this.set('isExpanded', false);
  },

  expand: function() {
    this.set('isExpanded', true);
  },

  currentUser: oneWay('currentSession.userContent'),
  bestuursEenheidNaam: oneWay('currentSession.groupContent.naam'),

  async ensureOriginator(){
    const berichten = (await this.get('conversatie.berichten')).sortBy('verzonden');
    const ourGroup = await this.get('currentSession.group');

    for( let bericht of berichten ){
      let sender = await bericht.van;
      if( sender && sender.id !== ourGroup.id ) {
        this.set('originator', sender);
        return;
      }
    }

    // if no originator could be found, we reset the property
    this.set('originator', null);
  }
});
