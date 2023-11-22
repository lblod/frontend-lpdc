import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import {
  hasConcept,
  isConceptUpdated,
} from 'frontend-lpdc/models/public-service';
import { inject as service } from '@ember/service';
import ENV from 'frontend-lpdc/config/environment';

export default class PublicServicesDetailsController extends Controller {
  @service store;
  @service('public-service') publicServiceService;

  // We use a separate flag, otherwise the message would be hidden before the save was actually completed
  @tracked reviewStatus;
  @tracked shouldShowUnlinkWarning = false;

  get showReviewRequiredMessage() {
    return Boolean(this.reviewStatus);
  }

  get isConceptUpdatedStatus() {
    if (!this.showReviewRequiredMessage) {
      return false;
    }

    return isConceptUpdated(this.reviewStatus);
  }

  get canLinkConcept() {
    const { publicService } = this.model;

    return !hasConcept(publicService) && !publicService.isSent;
  }

  get canUnlinkConcept() {
    const { publicService } = this.model;
    return (
      hasConcept(publicService) &&
      !publicService.isSent &&
      !this.shouldShowUnlinkWarning
    );
  }

  get conceptFormalInformalVersion() {
    return this.model.languageVersionOfConcept.includes('informal')
      ? 'je-versie'
      : 'u-versie';
  }

  get shouldShowContentGeneratedWarning() {
    return (
      this.isNewlyCreatedPublicService &&
      this.publicServiceHasConcept &&
      this.isConceptLanguageVersionGenerated
    );
  }

  get publicServiceHasConcept() {
    return !!this.model.publicService.concept.id;
  }

  get isConceptLanguageVersionGenerated() {
    return this.model.languageVersionOfConcept.includes('generated');
  }

  get isNewlyCreatedPublicService() {
    const created = this.model.publicService.created.toString();
    const modified = this.model.publicService.modified.toString();
    return created === modified;
  }

  get ipdcConceptCompareLink() {
    const productId = this.model.publicService.concept.get('productId');
    const languageVersion = this.model.publicServiceLanguageVersion.includes(
      'informal'
    )
      ? 'nl/informeel'
      : 'nl';
    const latestSnapshot = this.getUuidFromUri(
      this.model.publicService.concept.get('versionedSource')
    );
    const publicServiceSnapshot = this.getUuidFromUri(
      this.model.publicService.versionedSource
    );
    return `${ENV.ipdcUrl}/${languageVersion}/concept/${productId}/revisie/vergelijk?revisie1=${publicServiceSnapshot}&revisie2=${latestSnapshot}`;
  }

  @action
  showUnlinkWarning() {
    this.shouldShowUnlinkWarning = true;
  }

  @action
  hideUnlinkWarning() {
    this.shouldShowUnlinkWarning = false;
  }

  @dropTask
  *markAsReviewed() {
    let { publicService } = this.model;
    publicService.reviewStatus = null;

    yield publicService.save();

    this.reviewStatus = null;
  }

  @dropTask()
  *unlinkConcept() {
    const { publicService } = this.model;
    yield this.publicServiceService.unlinkConcept(publicService.id);
    yield publicService.concept.reload();
    this.hideUnlinkWarning();
  }

  getUuidFromUri(uri) {
    const segmentedUri = uri.split('/');
    return segmentedUri[segmentedUri.length - 1];
  }
}
