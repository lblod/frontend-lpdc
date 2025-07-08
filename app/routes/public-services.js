import { warn } from '@ember/debug';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { registerFormFields } from '@lblod/ember-submission-form-fields';
import ConceptSelector from 'frontend-lpdc/components/rdf-form-fields/concept-selector';
import RichTextEditor from 'frontend-lpdc/components/rdf-form-fields/rich-text-editor';
import TagSelector from 'frontend-lpdc/components/rdf-form-fields/tag-selector';
import SelectWithCreate from 'frontend-lpdc/components/rdf-form-fields/select-with-create';
import AddressSelector from 'frontend-lpdc/components/rdf-form-fields/address-selector';
import LpdcInputComponent from 'frontend-lpdc/components/rdf-form-fields/lpdc-input';
import LpdcDateTimeComponent from 'frontend-lpdc/components/rdf-form-fields/lpdc-date-time';
import LpdcRdfInputFieldsConceptSchemeMultiSelectorComponent from 'frontend-lpdc/components/rdf-form-fields/lpdc-concept-scheme-multi-selector';
import LpdcRdfHeadingComponent from 'frontend-lpdc/components/rdf-form-fields/lpdc-heading';
import { HttpRequest } from 'frontend-lpdc/helpers/http-request';

export default class PublicServicesRoute extends Route {
  @service currentSession;
  @service session;
  @service router;
  @service store;
  @service toaster;

  httpRequest = new HttpRequest(this.toaster);

  constructor() {
    super(...arguments);

    this.registerCustomFormFields();
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    return this.loadCurrentSession();
  }

  async model() {
    return {
      statusesOptions: await this.statutesConcepts(),
      producttypesOptions: await this.producttypesConcepts(),
      doelgroepenOptions: await this.loadDoelgroepenConcepts(),
      themasOptions: await this.themasConcepts(),
      creatorOptions: await this.creatorConcepts(),
      municipalityHasForMunicipalityMergerInstances:
        await this.municipalityHasForMunicipalityMergerInstances(),
    };
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
      {
        displayType: 'http://lblod.data.gift/display-types/selectWithCreate',
        edit: SelectWithCreate,
      },
      {
        displayType: 'http://lblod.data.gift/display-types/addressSelector',
        edit: AddressSelector,
      },
      {
        displayType: 'http://lblod.data.gift/display-types/lpdcInput',
        edit: LpdcInputComponent,
      },
      {
        displayType: 'http://lblod.data.gift/display-types/lpdcDateTime',
        edit: LpdcDateTimeComponent,
      },
      {
        displayType:
          'http://lblod.data.gift/display-types/lpdcConceptSchemeMultiSelector',
        edit: LpdcRdfInputFieldsConceptSchemeMultiSelectorComponent,
      },
      {
        displayType: 'http://lblod.data.gift/display-types/lpdcHeading',
        edit: LpdcRdfHeadingComponent,
      },
    ]);
  }

  async statutesConcepts() {
    return this.store.query('concept', {
      'filter[concept-schemes][:uri:]':
        'http://lblod.data.gift/concept-schemes/9cf6fa63-1f49-4d53-af06-e1c235ece10b',
      sort: 'label',
    });
  }

  async producttypesConcepts() {
    return this.store.query('concept', {
      'filter[concept-schemes][:uri:]':
        'https://productencatalogus.data.vlaanderen.be/id/conceptscheme/Type',
      sort: 'label',
    });
  }

  async loadDoelgroepenConcepts() {
    return this.store.query('concept', {
      'filter[concept-schemes][:uri:]':
        'https://productencatalogus.data.vlaanderen.be/id/conceptscheme/Doelgroep',
      sort: 'label',
    });
  }

  async themasConcepts() {
    return this.store.query('concept', {
      'filter[concept-schemes][:uri:]':
        'https://productencatalogus.data.vlaanderen.be/id/conceptscheme/Thema',
      sort: 'label',
    });
  }

  async creatorConcepts() {
    return await this.httpRequest.get(`/lpdc-management/creator-options/`);
  }

  async municipalityHasForMunicipalityMergerInstances() {
    const query = {
      'filter[created-by][:uri:]': this.currentSession.group.uri,
      'page[number]': 0,
      'fields[public-services]': 'name',
      'filter[for-municipality-merger]': true,
    };

    const result = await this.store.query('public-service', query);
    return result.length > 0;
  }
}
