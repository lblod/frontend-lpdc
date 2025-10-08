import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { serviceNeedsReview } from 'frontend-lpdc/models/public-service';

export default class PublicServicesIndexController extends Controller {
  @tracked search = '';
  @tracked sort = '-date-modified';
  @tracked page = 0;
  @tracked isReviewRequiredFilterEnabled = false;
  @tracked needsConversionFromFormalToInformalFilterEnabled = false;
  @tracked isYourEurope = false;
  @tracked forMunicipalityMerger = false;
  @tracked statusIds = [];
  @tracked producttypesIds = [];
  @tracked doelgroepenIds = [];
  @tracked themaIds = [];
  @tracked creatorIds = [];
  @tracked lastModifierIds = [];
  serviceNeedsReview = serviceNeedsReview;

  get statuses() {
    return this.statusIds.map((statusId) =>
      this.statusesOptions.find((option) => option.id === statusId),
    );
  }

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

  get creators() {
    return this.creatorIds.map((creatorId) =>
      this.creatorOptions.find((option) => option.id === creatorId),
    );
  }

  get lastModifiers() {
    return this.lastModifierIds.map((lastModifierId) =>
      this.lastModifierOptions.find((option) => option.id === lastModifierId),
    );
  }

  get publicServices() {
    return this.model['loadPublicServices'].isFinished
      ? this.model['loadPublicServices'].value
      : this.model['loadedPublicServices'] || [];
  }

  get statusesOptions() {
    return this.model.statusesOptions;
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

  get creatorOptions() {
    return this.model.creatorOptions;
  }

  get lastModifierOptions() {
    return this.model.lastModifierOptions;
  }

  get isChosenFormInformal() {
    return this.model.formalInformalChoice?.chosenForm === 'informal';
  }

  get municipalityHasForMunicipalityMergerInstances() {
    return this.model.municipalityHasForMunicipalityMergerInstances;
  }

  get showTableLoader() {
    return this.model.loadPublicServices.isRunning;
  }

  getValueFromTask(aTask) {
    if (this.model[aTask].isFinished) {
      return this.model[aTask].value;
    }

    return this.model[aTask] || [];
  }

  get hasResults() {
    return this.publicServices?.length > 0;
  }

  get hasErrored() {
    return this.model.loadPublicServices.isError;
  }

  get hasActiveFilters() {
    return (
      Boolean(this.search) ||
      this.isReviewRequiredFilterEnabled === true ||
      this.needsConversionFromFormalToInformalFilterEnabled === true ||
      this.isYourEurope === true ||
      this.forMunicipalityMerger === true ||
      this.statuses.length > 0 ||
      this.producttypes.length > 0 ||
      this.doelgroepen.length > 0 ||
      this.themas.length > 0 ||
      this.creators.length > 0 ||
      this.lastModifiers.length > 0
    );
  }

  @action
  resetFilters() {
    this.search = '';
    this.resetPagination();
    this.isReviewRequiredFilterEnabled = false;
    this.needsConversionFromFormalToInformalFilterEnabled = false;
    this.isYourEurope = false;
    this.forMunicipalityMerger = false;
    this.statusIds = [];
    this.producttypesIds = [];
    this.doelgroepenIds = [];
    this.themaIds = [];
    this.creatorIds = [];
    this.lastModifierIds = [];
  }

  @restartableTask
  *searchTask(searchValue) {
    yield timeout(500);

    this.search = searchValue;
    this.resetPagination();
  }

  @action
  toggleReviewRequiredFilter() {
    this.isReviewRequiredFilterEnabled = !this.isReviewRequiredFilterEnabled;
    this.resetPagination();
  }

  @action
  toggleNeedsConversionFromFormalToInformalFilter() {
    this.needsConversionFromFormalToInformalFilterEnabled =
      !this.needsConversionFromFormalToInformalFilterEnabled;
    this.resetPagination();
  }

  @action
  handleYourEuropeFilterChange(value) {
    this.isYourEurope = value;
    this.resetPagination();
  }

  @action
  handleForMunicipalityMergerFilterChange(value) {
    this.forMunicipalityMerger = value;
    this.resetPagination();
  }

  @action
  handleStatusesFilterChange(values) {
    this.statusIds = sortByLabel(values).map((pt) => pt.id);
    this.resetPagination();
  }

  @action
  handleProducttypesFilterChange(values) {
    this.producttypesIds = sortByLabel(values).map((pt) => pt.id);
    this.resetPagination();
  }

  @action
  handleDoelgroepenFilterChange(values) {
    this.doelgroepenIds = sortByLabel(values).map((dg) => dg.id);
    this.resetPagination();
  }

  @action
  handleThemasFilterChange(values) {
    this.themaIds = sortByLabel(values).map((pt) => pt.id);
    this.resetPagination();
  }

  @action
  handleCreatorsFilterChange(values) {
    this.creatorIds = values
      .sort((a, b) => {
        return a.fullName.localeCompare(b.fullName);
      })
      .map((creator) => creator.id);
    this.resetPagination();
  }

  @action
  handleLastModifiersFilterChange(values) {
    this.lastModifierIds = values
      .sort((a, b) => {
        return a.fullName.localeCompare(b.fullName);
      })
      .map((lastModifier) => lastModifier.id);
    this.resetPagination();
  }

  resetPagination() {
    this.page = 0;
  }
}

function sortByLabel(concepts = []) {
  return [...concepts].sort((a, b) => {
    return a.label.localeCompare(b.label);
  });
}
