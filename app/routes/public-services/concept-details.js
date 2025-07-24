import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublicServicesConceptDetailsRoute extends Route {
  @service('concept') conceptService;
  @service store;

  async model({ conceptId }) {
    const concept = await this.conceptService.loadConceptDetails(conceptId);

    const languageVersionOfConcept =
      await this.conceptService.loadConceptLanguageVersionByConceptUri(
        concept.uri
      );

    const existingInstances = await this.store.query('public-service', {
      'filter[concept][:id:]': concept.id,
      'fields[public-services]': 'name,date-created,date-modified',
    });

    return {
      concept,
      languageVersionOfConcept,
      hasExistingInstances: existingInstances.length > 0,
    };
  }
}
