import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import {
  SKOS,
  triplesForPath,
  updateSimpleFormValue,
} from '@lblod/submission-form-helpers';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { restartableTask, timeout } from 'ember-concurrency';
import { NamedNode } from 'rdflib';

const PAGE_SIZE = 50;

function byLabel(a, b) {
  const textA = a.label.toUpperCase();
  const textB = b.label.toUpperCase();
  return textA < textB ? -1 : textA > textB ? 1 : 0;
}

export default class LpdcConceptSchemeMultiSelector extends InputFieldComponent {
  inputId = 'select-' + guidFor(this);

  @tracked selected = null;
  @tracked options = [];
  @tracked searchEnabled = true;
  @tracked conceptLimit = PAGE_SIZE;
  @tracked isSearching = false;

  get canShowMoreConcepts() {
    return !this.isSearching && this.conceptLimit < this.options.length;
  }

  get subset() {
    return this.options.slice(0, this.conceptLimit);
  }

  constructor() {
    super(...arguments);
    this.loadOptions();
    this.loadProvidedValue();
  }

  loadOptions() {
    const metaGraph = this.args.graphs.metaGraph;
    const fieldOptions = this.args.field.options;
    const conceptScheme = new NamedNode(fieldOptions.conceptScheme);

    /**
     * NOTE: Most forms are now implemented to have a default "true" behavior
     */
    if (fieldOptions.searchEnabled !== undefined) {
      this.searchEnabled = fieldOptions.searchEnabled;
    }

    this.options = this.args.formStore
      .match(undefined, SKOS('inScheme'), conceptScheme, metaGraph)
      .map((t) => {
        const label = this.args.formStore.any(
          t.subject,
          SKOS('prefLabel'),
          undefined,
          metaGraph
        );
        return { subject: t.subject, label: label && label.value };
      });
    this.options.sort(byLabel);
  }

  loadProvidedValue() {
    if (this.isValid) {
      const matches = triplesForPath(this.storeOptions, true).values;
      this.selected = this.options.filter((opt) =>
        matches.find((m) => m.equals(opt.subject))
      );
    }
  }

  @action
  handleUpdateSelectionFromThreeWayCompare(optionValues) {
    this.updateSelection(
      optionValues.map((value) => ({
        subject: new NamedNode(value),
      }))
    );
  }

  @action
  updateSelection(options) {
    this.selected = options;

    // Retrieve options in store
    const matches = triplesForPath(this.storeOptions, true).values;
    const matchingOptions = matches.filter((m) =>
      this.options.find((opt) => m.equals(opt.subject))
    );

    // Cleanup old value(s) in the store
    matchingOptions
      .filter((m) => !options.find((opt) => m.equals(opt.subject)))
      .forEach((m) => updateSimpleFormValue(this.storeOptions, undefined, m));

    // Insert new value in the store
    options
      .filter((opt) => !matchingOptions.find((m) => opt.subject.equals(m)))
      .forEach((option) =>
        updateSimpleFormValue(this.storeOptions, option.subject)
      );

    this.hasBeenFocused = true;
    super.updateValidations();
    this.loadProvidedValue();
  }

  @action
  registerAPI(api) {
    // PowerSelect doesn't have an action to let us know when the search data is reset, so we use the registerAPI as a workaround.
    // It gets called every time any internal state has changed, so we can use it to detect when the searchText has cleared.
    if (!api.searchText && this.isSearching) {
      this.isSearching = false;
    }
  }

  search = restartableTask(async (term) => {
    await timeout(600);
    this.isSearching = true;

    return this.options.filter((value) =>
      value.label.toLowerCase().includes(term.toLowerCase())
    );
  });

  showMoreConcepts = restartableTask(async () => {
    if (this.canShowMoreConcepts) {
      // We add an artificial delay so users see the loading animation and know something is happening
      await timeout(300);

      this.conceptLimit += PAGE_SIZE;
    }
  });
}
