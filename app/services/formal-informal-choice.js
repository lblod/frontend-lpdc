import Service, { inject as service } from '@ember/service';

export default class FormalInformalChoiceService extends Service {
  @service store;
  @service currentSession;

  async isChoiceMade() {
    const choices = await this.store.findAll('formal-informal-choice');
    return (
      !!choices.length ||
      localStorage.getItem('makeFormalInformalChoiceLater') === 'true'
    );
  }

  async saveChoice(value) {
    const choice = this.store.createRecord('formal-informal-choice', {
      chosenForm: value,
      dateCreated: new Date().toISOString(),
      bestuurseenheid: this.currentSession.group,
    });
    await choice.save();
  }

  makeChoiceLater() {
    localStorage.setItem('makeFormalInformalChoiceLater', 'true');
  }

  enableChoiceIfNotPreviouslyConfirmed() {
    localStorage.removeItem('makeFormalInformalChoiceLater');
  }

  async getChoice() {
    const choices = await this.store.findAll('formal-informal-choice');
    const sortedChoices = choices.sortBy('dateCreated');
    return sortedChoices[0];
  }
}
