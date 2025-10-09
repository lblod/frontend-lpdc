import Service, { inject as service } from '@ember/service';
import { HttpRequest } from 'frontend-lpdc/helpers/http-request';

export default class ConceptSnapshotService extends Service {
  @service store;
  @service toaster;

  httpRequest = new HttpRequest(this.toaster);

  async getFunctionallyChangedFields(
    currentConceptSnapshot,
    latestConceptSnapshot,
  ) {
    if (currentConceptSnapshot && latestConceptSnapshot) {
      return this.httpRequest.get(
        `/lpdc-management/concept-snapshot/compare?snapshot1=${encodeURIComponent(
          currentConceptSnapshot,
        )}&snapshot2=${encodeURIComponent(latestConceptSnapshot)}`,
      );
    }
  }
}
