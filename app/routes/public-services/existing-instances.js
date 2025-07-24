import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublicServicesExistingInstancesRoute extends Route {
  @service('concept') conceptService;
  @service store;

  queryParams = {
    page: {
      refreshModel: true,
    },
    sort: {
      refreshModel: true,
    },
  };

  async model({ sort, page, conceptId }) {
    const concept = await this.conceptService.loadConceptDetails(conceptId);
    const query = {
      'filter[concept][:id:]': concept.id,
      'page[number]': page,
      'fields[public-services]':
        'name,date-created,date-modified,creator,last-modifier,status',
      include: 'creator,last-modifier,status',
    };

    if (sort) {
      query.sort = sort;
    }

    const existingInstances = await this.store.query('public-service', query);

    return {
      concept,
      existingInstances,
    };
  }
}
