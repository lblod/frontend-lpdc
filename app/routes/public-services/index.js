import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import SelectUOrJeModal from 'frontend-lpdc/components/select-u-or-je-modal';
import NotificationModal from 'frontend-lpdc/components/notification-modal';
import { buildPublicServiceFilters } from 'frontend-lpdc/utils/public-service-query';

export default class PublicServicesIndexRoute extends Route {
  @service store;
  @service currentSession;
  @service modals;
  @service formalInformalChoice;
  @service('public-service') publicServiceService;
  @service('notification') notificationService;

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
    isFeedbackAvailable: {
      refreshModel: true,
    },
    isNotificationEnabled: {
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
    if (!(await this.notificationService.isChoiceMade())) {
      this.modals.open(NotificationModal, {
        makeChoiceLaterHandler: () => {
          this.notificationService.makeChoiceLater();
        },
        submitHandler: async (
          selectedNotificationChoice,
          emailAddress,
          selectedNotificationActions,
          selectedNotificationFrequency,
          wantsStatusReports,
        ) => {
          await this.notificationService.updateNotificationPreference(
            selectedNotificationChoice,
            emailAddress,
            selectedNotificationActions,
            selectedNotificationFrequency,
            wantsStatusReports,
          );
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

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.loadNotificationInstances();
  }

  loadPublicServicesTask = restartableTask(async (params) => {
    const query = {
      ...buildPublicServiceFilters(params, this.currentSession),
      'page[number]': params.page,
      'fields[public-services]':
        'name,product-id,type,target-audiences,thematic-areas,publication-media,date-created,date-modified,status,needs-conversion-from-formal-to-informal,review-status,for-municipality-merger,feedback-available',
      include:
        'type,target-audiences,thematic-areas,publication-media,status,review-status,creator,last-modifier',
    };

    if (params.sort) {
      query.sort = params.sort;
    }

    return await this.store.query('public-service', query);
  });
}
