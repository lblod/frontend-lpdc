import Service, { inject as service } from '@ember/service';
import { HttpRequest } from 'frontend-lpdc/helpers/http-request';
import moment from 'moment';

export default class PublicServiceService extends Service {
  @service store;
  @service('concept') conceptService;
  @service toaster;

  httpRequest = new HttpRequest(this.toaster);

  async bestuurseenheidHasPublicServices() {
    const query = { 'page[size]': 1, 'page[number]': 0 };
    const publicServices = await this.store.query('public-service', query);
    return publicServices.length !== 0;
  }

  async loadPublicServiceDetails(publicServiceId) {
    return this.store.findRecord('public-service', publicServiceId, {
      reload: true,
      include:
        'type,status,target-audiences,concept,review-status,thematic-areas,publication-media,creator,last-modifier',
    });
  }

  async updatePublicService(publicService, formData) {
    await this.httpRequest.put(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}`,
      formData,
      {
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );
  }

  async getPublicServiceForm(publicService, formId) {
    let latestSnapshotQueryParams = '';
    if (publicService.reviewStatus) {
      const latestSnapshot = publicService.concept.get(
        'hasLatestFunctionalChange'
      );
      if (latestSnapshot) {
        latestSnapshotQueryParams = `?latestConceptSnapshotId=${encodeURIComponent(
          latestSnapshot
        )}`;
      }
    }

    return this.httpRequest.get(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/form/${formId}${latestSnapshotQueryParams}`
    );
  }

  async unlinkConcept(publicService) {
    await this.httpRequest.put(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/ontkoppelen`,
      {},
      {
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );
    await this.loadPublicServiceDetails(publicService.id);
  }

  async linkConcept(publicService, concept) {
    await this.httpRequest.put(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/koppelen/${encodeURIComponent(concept.uri)}`,
      {},
      {
        test: 'test',
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );
    await this.loadPublicServiceDetails(publicService.id);
  }

  async confirmUpToDateTillLatestFunctionalChange(publicService) {
    await this.httpRequest.post(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/confirm-up-to-date-till`,
      {
        upToDateTillConceptSnapshotId: publicService.concept.get(
          'hasLatestFunctionalChange'
        ),
      },
      {
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );

    await this.loadPublicServiceDetails(publicService.id);
  }

  async confirmInstanceAlreadyInformal(publicService) {
    await this.httpRequest.post(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/confirm-instance-is-already-informal`,
      {},
      {
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );

    await this.loadPublicServiceDetails(publicService.id);
  }

  async convertInstanceToInformal(publicService) {
    await this.httpRequest.post(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/convert-instance-to-informal`,
      {},
      {
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );

    await this.loadPublicServiceDetails(publicService.id);
  }

  async fullyTakeConceptSnapshotOver(publicService) {
    await this.httpRequest.post(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/fully-take-concept-snapshot-over`,
      {
        conceptSnapshotId: publicService.concept.get(
          'hasLatestFunctionalChange'
        ),
      },
      {
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );

    await this.loadPublicServiceDetails(publicService.id);
  }

  async createPublicService(conceptId) {
    const responseBody = await this.httpRequest.post(
      '/lpdc-management/public-services',
      conceptId ? { conceptId: conceptId } : {}
    );
    return responseBody.data.id;
  }

  async deletePublicService(publicServiceId) {
    await this.httpRequest.delete(
      `/lpdc-management/public-services/${encodeURIComponent(publicServiceId)}`
    );
  }

  async copyPublicService(publicService, forMunicipalityMerger) {
    const responseBody = await this.httpRequest.post(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/copy`,
      {
        forMunicipalityMerger: forMunicipalityMerger,
      }
    );
    return responseBody.data.id;
  }

  async reopenPublicService(publicService) {
    await this.httpRequest.put(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/reopen`,
      {},
      {
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );
    await this.loadPublicServiceDetails(publicService.id);
  }

  async validateInstance(publicService) {
    return await this.httpRequest.put(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/validate-for-publish`,
      {},
      {
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );
  }

  async publishInstance(publicService) {
    await this.httpRequest.put(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/publish`,
      {},
      {
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );
    await this.loadPublicServiceDetails(publicService.id);
  }

  async isPublished(publicService) {
    const response = await this.httpRequest.get(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/is-published`
    );
    return response?.isPublished;
  }
}
