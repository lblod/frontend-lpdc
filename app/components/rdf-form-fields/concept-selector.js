import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import {
  triplesForPath,
  updateSimpleFormValue,
  removeDatasetForSimpleFormValue,
} from '@lblod/submission-form-helpers';
import { restartableTask, timeout } from 'ember-concurrency';
import { NamedNode } from 'rdflib';
import PowerSelect from 'ember-power-select/components/power-select';
import PowerSelectMultiple from 'ember-power-select/components/power-select-multiple';

export default class ConceptSelector extends InputFieldComponent {
  @service store;

  @tracked selected = null;
  @tracked options = [];
  searchTerm;
  inputId = 'concept-selector-' + guidFor(this);

  constructor() {
    super(...arguments);
    this.loadDefaultSelectOptions();
    this.loadPersistedValues();
  }

  get shouldPreloadData() {
    return this.args.field.options.preload ?? true;
  }

  get isSearchEnabled() {
    return this.args.field.options.search ?? true;
  }

  get isBackendSearch() {
    return this.args.field.options.backendSearch ?? true;
  }

  get searchMessage() {
    return this.args.field.options.searchMessage || 'Typ om te zoeken';
  }

  get isMultiSelect() {
    return Boolean(this.args.field.options.multiple);
  }

  get selectComponent() {
    return this.isMultiSelect ? PowerSelectMultiple : PowerSelect;
  }

  get canLoadMoreConcepts() {
    return Boolean(this.options?.meta?.pagination?.next);
  }

  async loadDefaultSelectOptions() {
    if (this.shouldPreloadData) {
      this.options = await this.loadConcepts();
    } else {
      this.options = [];
    }
  }

  async loadConcepts(query = {}) {
    let { conceptScheme, preloadAmount = 30 } = this.args.field.options;

    return await this.store.query('concept', {
      'filter[concept-schemes][:uri:]': conceptScheme,
      sort: 'label',
      'page[number]': 0,
      'page[size]': preloadAmount,
      ...query,
    });
  }

  async loadPersistedValues() {
    const matches = triplesForPath(this.storeOptions).values;

    if (matches.length > 0) {
      if (this.isMultiSelect) {
        let conceptPromises = matches.map(async (concept) => {
          let conceptUri = concept.value;
          return await this.loadConceptRecordByUri(conceptUri);
        });

        let concepts = await Promise.all(conceptPromises);
        this.selected = sortByLabel(concepts);
      } else {
        let conceptUri = matches[0].value;
        this.selected = await this.loadConceptRecordByUri(conceptUri);
      }
    }
  }

  async loadConceptRecordByUri(uri) {
    let response = await this.store.query('concept', {
      'filter[:uri:]': uri,
    });

    return response[0];
  }

  @action
  registerAPI(api) {
    // PowerSelect doesn't have an action to let us know when the search data is reset, so we use the registerAPI as a workaround.
    // It gets called every time any internal state has changed, so we can use it to detect when the searchText has cleared.
    if (!api.searchText && this.searchTerm) {
      this.searchTerm = null;
      this.loadDefaultSelectOptions();
    }
  }

  @action
  updateSelection(newValues) {
    if (this.isMultiSelect) {
      this.updateSelectionInStore(
        newValues.map((newValue) => ({ uri: newValue }))
      );
    } else {
      this.updateSelectionInStore(
        newValues[0] ? { uri: newValues[0] } : undefined
      );
    }
  }

  @action
  updateSelectionInStore(newSelection) {
    this.selected = newSelection;

    // Cleanup old value(s) in the store
    const matches = triplesForPath(this.storeOptions, true).values;
    matches.forEach((m) =>
      removeDatasetForSimpleFormValue(m, this.storeOptions)
    );

    if (this.isMultiSelect) {
      if (newSelection.length > 0) {
        newSelection.forEach((concept) => {
          updateSimpleFormValue(this.storeOptions, new NamedNode(concept.uri));
        });
      }
    } else {
      if (newSelection) {
        updateSimpleFormValue(
          this.storeOptions,
          new NamedNode(newSelection.uri)
        );
      }
    }

    this.loadPersistedValues();
    this.hasBeenFocused = true;
    super.updateValidations();
  }

  loadMoreConcepts = restartableTask(async () => {
    if (this.canLoadMoreConcepts) {
      const query = {
        'page[number]': this.options.meta.pagination.next.number,
      };

      if (this.searchTerm) {
        query.filter = this.searchTerm;
      }

      const newConcepts = await this.loadConcepts(query);
      this.options = [...this.options, ...newConcepts];
      this.options.meta = newConcepts.meta;
    }
  });

  @restartableTask
  *search(searchTerm) {
    yield timeout(300);

    this.searchTerm = searchTerm;
    this.options = yield this.loadConcepts({
      filter: searchTerm,
    });
  }
}

function sortByLabel(concepts = []) {
  return [...concepts].sort((a, b) => {
    return a.label.localeCompare(b.label);
  });
}
