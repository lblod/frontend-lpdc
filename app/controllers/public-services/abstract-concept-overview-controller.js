import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';

export default class AbstractConceptOverviewController extends Controller {
  @tracked search = '';
  @tracked sort = 'name';
  @tracked page = 0;
  @tracked isNewConcept = false;
  @tracked isNotInstantiated = false;
  @tracked isYourEurope = false;
  @tracked producttypesIds = [];
  @tracked doelgroepenIds = [];
  @tracked themaIds = [];

  get doelgroepen() {
    return this.doelgroepenIds.map((doelgroepId) =>
      this.doelgroepenOptions.find((option) => option.id === doelgroepId),
    );
  }

  get producttypes() {
    return this.producttypesIds.map((producttypeId) =>
      this.producttypesOptions.find((option) => option.id === producttypeId),
    );
  }

  get themas() {
    return this.themaIds.map((themaId) =>
      this.themasOptions.find((option) => option.id === themaId),
    );
  }

  get publicServices() {
    return this.model['loadConceptualPublicServices'].isFinished
      ? this.model['loadConceptualPublicServices'].value
      : this.model['loadedConceptualPublicServices'] || [];
  }

  get producttypesOptions() {
    return this.model.producttypesOptions;
  }

  get doelgroepenOptions() {
    return this.model.doelgroepenOptions;
  }

  get themasOptions() {
    return this.model.themasOptions;
  }

  get showTableLoader() {
    return this.model.loadConceptualPublicServices.isRunning;
  }

  get hasResults() {
    return this.publicServices?.length > 0;
  }

  get hasErrored() {
    return this.model.loadConceptualPublicServices.isError;
  }

  getValueFromTask(aTask) {
    if (this.model[aTask].isFinished) {
      return this.model[aTask].value;
    }

    return this.model[aTask] || [];
  }

  get hasActiveFilters() {
    return (
      Boolean(this.search) ||
      this.isNewConcept === true ||
      this.isNotInstantiated === true ||
      this.isYourEurope === true ||
      this.producttypes.length > 0 ||
      this.doelgroepen.length > 0 ||
      this.themas.length > 0
    );
  }

  @action
  handleNewConceptFilterChange(value) {
    this.isNewConcept = value;
    this.page = 0;
  }

  @action
  handleNotInstantiatedConceptFilterChange(value) {
    this.isNotInstantiated = value;
    this.page = 0;
  }

  @action
  handleYourEuropeConceptFilterChange(value) {
    this.isYourEurope = value;
    this.page = 0;
  }

  @action
  handleDoelgroepenConceptFilterChange(values) {
    this.doelgroepenIds = sortByLabel(values).map((dg) => dg.id);
    this.page = 0;
  }

  @action
  handleProducttypesConceptFilterChange(values) {
    this.producttypesIds = sortByLabel(values).map((pt) => pt.id);
    this.page = 0;
  }

  @action
  handleThemasConceptFilterChange(values) {
    this.themaIds = sortByLabel(values).map((pt) => pt.id);
    this.page = 0;
  }

  @action
  resetFilters() {
    this.search = '';
    this.page = 0;
    this.isNewConcept = false;
    this.isNotInstantiated = false;
    this.isYourEurope = false;
    this.producttypesIds = [];
    this.doelgroepenIds = [];
    this.themaIds = [];
  }

  @restartableTask
  *searchTask(searchValue) {
    yield timeout(500);

    this.search = searchValue;
    this.page = 0;
  }
}

function sortByLabel(concepts = []) {
  return [...concepts].sort((a, b) => {
    return a.label.localeCompare(b.label);
  });
}
