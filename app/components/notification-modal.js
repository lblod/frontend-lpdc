import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import {
  NOTIFICATION_ACTIONS,
  STATUS_REPORT,
} from 'frontend-lpdc/models/notification-preference';
import AlarmIcon from './icons/alarm';

export default class NotificationModalComponent extends Component {
  @service currentSession;
  @tracked currentStep = 1;
  @tracked selectedNotificationChoice = null;
  @tracked selectedNotificationActions = null;
  @tracked selectedNotificationFrequency = null;
  @tracked wantsStatusReports = null;
  @tracked emailAddress = '';
  NOTIFICATION_ACTIONS = NOTIFICATION_ACTIONS;
  AlarmIcon = AlarmIcon;

  constructor() {
    super(...arguments);

    const preference = this.args.data.notificationPreference;
    if (preference) {
      this.selectedNotificationChoice = preference.notificationsEnabled;
      this.emailAddress = preference.emailAddress;
      this.currentStep = this.selectedNotificationChoice ? 2 : 1;
      if (preference.notificationsEnabled) this.loadRuleConfigs(preference);
    } else {
      this.emailAddress = this.currentSession.user.mailAdres;
    }
  }

  async loadRuleConfigs(preference) {
    const ruleConfigs = await preference.notificationRuleConfigs;
    this.selectedNotificationActions = ruleConfigs
      .filter((rc) => rc.notificationRule !== STATUS_REPORT)
      .map((rc) => rc.notificationRule);

    const actionConfig = ruleConfigs.find(
      (rc) => rc.notificationRule !== STATUS_REPORT,
    );
    this.selectedNotificationFrequency = actionConfig?.frequency ?? null;
    this.wantsStatusReports = ruleConfigs.some(
      (rc) => rc.notificationRule === STATUS_REPORT,
    );
  }

  get isChoiceMade() {
    return this.selectedNotificationChoice !== null;
  }

  get emptyFormFields() {
    return (
      !this.emailAddress ||
      this.selectedNotificationFrequency === null ||
      this.selectedNotificationActions === null ||
      this.selectedNotificationActions.length === 0 ||
      this.wantsStatusReports === null
    );
  }

  @action
  updateEmailAddress(event) {
    this.emailAddress = event.target.value;
  }

  @action
  handleNotificationActionsChange(value) {
    this.selectedNotificationActions = value;
  }

  @action
  handleNotificationFrequencyChange(value) {
    this.selectedNotificationFrequency = value;
  }

  @action
  handleWantsStatusReportsChange(value) {
    this.wantsStatusReports = value;
  }

  @action
  save() {
    this.args.data.submitHandler(
      this.selectedNotificationChoice,
      this.emailAddress,
      this.selectedNotificationActions,
      this.selectedNotificationFrequency,
      this.wantsStatusReports,
    );
    this.close();
  }

  @action
  goToNextStep() {
    this.currentStep = 2;
  }
  @action
  goToPreviousStep() {
    this.currentStep = 1;
  }

  @action
  handleNotificationChange(choice) {
    this.selectedNotificationChoice = choice;
  }

  @action
  makeChoiceLater() {
    this.args.data.makeChoiceLaterHandler();
    this.close();
  }

  @action
  close() {
    this.args.close();
  }
}
