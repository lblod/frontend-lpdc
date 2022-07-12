import Route from '@ember/routing/route';

export default class EredienstMandatenbeheerMandatarisRoute extends Route {
  model(params) {
    return this.store.findRecord('worship-mandatee', params.mandateeId, {
      include: 'is-bestuurlijke-alias-van,bekleedt,type-half',
    });
  }
}
