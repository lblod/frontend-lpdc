import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import SelectUOrJeModal from 'frontend-lpdc/components/select-u-or-je-modal';

export default class PublicServicesIndexRoute extends Route {
  @service store;
  @service currentSession;
  @service modals;
  @service formalInformalChoice;
  @service('public-service') publicServiceService;

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    page: {
      refreshModel: true,
    },
    sort: {
      refreshModel: true,
    },
    isReviewRequiredFilterEnabled: {
      refreshModel: true,
    },
    needsConversionFromFormalToInformalFilterEnabled: {
      refreshModel: true,
    },
    isYourEurope: {
      refreshModel: true,
    },
    forMunicipalityMerger: {
      refreshModel: true,
    },
    statusIds: {
      refreshModel: true,
    },
    producttypesIds: {
      refreshModel: true,
    },
    doelgroepenIds: {
      refreshModel: true,
    },
    themaIds: {
      refreshModel: true,
    },
    creatorIds: {
      refreshModel: true,
    },
    lastModifierIds: {
      refreshModel: true,
    },
  };

  async beforeModel() {
    const hasPublicServices =
      await this.publicServiceService.bestuurseenheidHasPublicServices();
    if (!(await this.formalInformalChoice.isChoiceMade())) {
      this.modals.open(SelectUOrJeModal, {
        newLpdcUser: !hasPublicServices,
        submitHandler: async (value) => {
          await this.formalInformalChoice.saveChoice(value);
        },
        makeChoiceLaterHandler: () => {
          this.formalInformalChoice.makeChoiceLater();
        },
      });
    }
  }

  async model(params) {
    return {
      ...this.modelFor('public-services'),
      formalInformalChoice: await this.formalInformalChoice.getChoice(),
      loadPublicServices: this.loadPublicServicesTask.perform(params),
      loadedPublicServices: this.loadPublicServicesTask.lastSuccessful?.value,
    };
  }

  @restartableTask
  *loadPublicServicesTask({
    search,
    page,
    sort,
    isReviewRequiredFilterEnabled,
    needsConversionFromFormalToInformalFilterEnabled,
    isYourEurope,
    forMunicipalityMerger,
    doelgroepenIds,
    producttypesIds,
    themaIds,
    creatorIds,
    lastModifierIds,
    statusIds,
  }) {
    const query = {
      'filter[created-by][:uri:]': this.currentSession.group.uri,
      'page[number]': page,
      'fields[public-services]':
        'name,product-id,type,target-audiences,thematic-areas,publication-media,date-created,date-modified,status,needs-conversion-from-formal-to-informal,review-status,for-municipality-merger',
      include:
        'type,target-audiences,thematic-areas,publication-media,status,review-status,creator,last-modifier',
    };

    if (search) {
      query['filter'] = search.trim();
    }

    if (sort) {
      query.sort = sort;
    }

    if (isReviewRequiredFilterEnabled) {
      query['filter[:has:review-status]'] = true;
    }

    if (needsConversionFromFormalToInformalFilterEnabled) {
      query['filter[needs-conversion-from-formal-to-informal]'] = true;
    }

    if (isYourEurope) {
      query['filter[publication-media][:uri:]'] =
        'https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/YourEurope';
    }

    if (forMunicipalityMerger) {
      query['filter[for-municipality-merger]'] = true;
    }

    if (statusIds?.length > 0) {
      query['filter[status][:id:]'] = statusIds.join(',');
    }

    if (producttypesIds?.length > 0) {
      query['filter[type][:id:]'] = producttypesIds.join(',');
    }

    if (doelgroepenIds?.length > 0) {
      query['filter[target-audiences][:id:]'] = doelgroepenIds.join(',');
    }

    if (themaIds?.length > 0) {
      query['filter[thematic-areas][:id:]'] = themaIds.join(',');
    }

    if (creatorIds?.length > 0) {
      query['filter[creator][:id:]'] = creatorIds.join(',');
    }

    if (lastModifierIds?.length > 0) {
      query['filter[last-modifier][:id:]'] = lastModifierIds.join(',');
    }

    return yield this.store.query('public-service', query);
  }
}
