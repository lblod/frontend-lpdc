import Service, { service } from '@ember/service';
import { HttpRequest } from '../helpers/http-request';

export default class HeerlijkHelderService extends Service {
  @service toaster;
  httpRequest = new HttpRequest(this.toaster);
  generations = new Map();

  keyForGeneration(subject, predicate) {
    return `${subject}|${predicate}`;
  }

  pendingGeneration(key) {
    return this.generations.get(key);
  }

  generate(key, payload) {
    if (this.generations.has(key)) return this.generations.get(key);
    console.log('Generating rewrite for', key, payload);
    const promise = this.httpRequest
      .post('/hh-rewrites', payload, {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
      })
      .finally(() => this.generations.delete(key));
    this.generations.set(key, promise);
    return promise;
  }
}
