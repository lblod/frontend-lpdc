import Route from '@ember/routing/route';
import { restartableTask } from 'ember-concurrency';

export default class AbstractConceptOverviewRoute extends Route {
  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    isNewConcept: {
      refreshModel: true,
    },
    isNotInstantiated: {
      refreshModel: true,
    },
    isYourEurope: {
      refreshModel: true,
    },
    doelgroepenIds: {
      refreshModel: true,
    },
    producttypesIds: {
      refreshModel: true,
    },
    themaIds: {
      refreshModel: true,
    },
    page: {
      refreshModel: true,
    },
    sort: {
      refreshModel: true,
    },
  };

  loadConceptualPublicServicesTask = restartableTask(
    async ({
      search,
      page,
      sort,
      isNewConcept,
      isNotInstantiated,
      isYourEurope,
      doelgroepenIds,
      producttypesIds,
      themaIds,
    }) => {
      return await this.conceptService.loadAllConcepts({
        search,
        page,
        sort,
        isNewConcept,
        isNotInstantiated,
        isYourEurope,
        doelgroepenIds,
        producttypesIds,
        themaIds,
      });
    },
  );
}
