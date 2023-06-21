import { warn } from '@ember/debug';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { registerFormFields } from '@lblod/ember-submission-form-fields';
import ConceptSelector from 'frontend-lpdc/components/rdf-form-fields/concept-selector';
import RichTextEditor from 'frontend-lpdc/components/rdf-form-fields/rich-text-editor';
import TagSelector from 'frontend-lpdc/components/rdf-form-fields/tag-selector';

export default class PublicServicesRoute extends Route {
  @service currentSession;
  @service session;
  @service router;

  constructor() {
    super(...arguments);

    this.registerCustomFormFields();
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    return this.loadCurrentSession();
  }

  async loadCurrentSession() {
    try {
      await this.currentSession.load();
    } catch (error) {
      warn(error, { id: 'current-session-load-failure' });
      this.router.transitionTo('auth.logout');
    }
  }

  registerCustomFormFields() {
    registerFormFields([
      {
        displayType: 'http://lblod.data.gift/display-types/richText',
        edit: RichTextEditor,
      },
      {
        displayType: 'http://lblod.data.gift/display-types/conceptSelector',
        edit: ConceptSelector,
      },
      {
        displayType: 'http://lblod.data.gift/display-types/tagSelector',
        edit: TagSelector,
      },
    ]);
  }
}
