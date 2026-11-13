import Service, { service } from '@ember/service';
import { HttpRequest } from '../helpers/http-request';

export default class HeerlijkHelderService extends Service {
  @service store;
  @service toaster;
  httpRequest = new HttpRequest(this.toaster);

  // generations still waiting for hh-rewrite, keyed per field
  generations = new Map();

  keyForGeneration(subject, predicate) {
    return `${subject}|${predicate}`;
  }

  pendingGeneration(key) {
    return this.generations.get(key);
  }

  generate(key, payload) {
    if (this.generations.has(key)) return this.generations.get(key);
    const promise = this.httpRequest
      .post('/hh-rewrites', payload, {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
      })
      .then((response) =>
        this.store.findRecord('generation-activity', response.data.id, {
          reload: true,
        }),
      )
      .finally(() => this.generations.delete(key));
    this.generations.set(key, promise);
    return promise;
  }

  async getGenerationActivities(publicService, subject, predicate) {
    const activities = await this.store.query('generation-activity', {
      filter: {
        'field-generation': {
          instance: { ':id:': publicService.id },
          ':exact:related-subject': subject,
          ':exact:related-field': predicate,
        },
      },
      sort: 'attempt-number',
    });
    return [...activities];
  }
}
