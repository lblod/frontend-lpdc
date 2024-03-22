import Component from '@glimmer/component';
import {
  hasConcept,
  isConceptUpdated,
} from 'frontend-lpdc/models/public-service';
import { action } from '@ember/object';
import ENV from 'frontend-lpdc/config/environment';
import { tracked } from '@glimmer/tracking';

export default class DetailsHeaderComponent extends Component {
  @tracked shouldShowUnlinkWarning = false;

  get canLinkConcept() {
    const { publicService } = this.args;

    return !hasConcept(publicService) && !publicService.isSent;
  }

  get canUnlinkConcept() {
    const { publicService } = this.args;
    return (
      hasConcept(publicService) &&
      !publicService.isSent &&
      !this.shouldShowUnlinkWarning
    );
  }

  get publicServiceHasConcept() {
    return !!this.args.publicService.concept.id;
  }

  get isConceptLanguageVersionGenerated() {
    return this.args.languageVersionOfConcept.includes('generated');
  }

  get isNewlyCreatedPublicService() {
    const dateCreated = this.args.publicService.dateCreated.toString();
    const dateModified = this.args.publicService.dateModified.toString();
    return dateCreated === dateModified;
  }

  get shouldShowContentGeneratedWarning() {
    return (
      this.isNewlyCreatedPublicService &&
      this.publicServiceHasConcept &&
      this.isConceptLanguageVersionGenerated
    );
  }

  get isConceptUpdatedStatus() {
    return isConceptUpdated(this.args.publicService.reviewStatus);
  }

  get conceptFormalInformalVersion() {
    return this.args.languageVersionOfConcept.includes('informal')
      ? 'je-versie'
      : 'u-versie';
  }

  get ipdcConceptCompareLink() {
    const productId = this.args.publicService.concept.get('productId');
    const languageVersion = this.args.publicServiceLanguageVersion.includes(
      'informal'
    )
      ? 'nl/informeel'
      : 'nl';

    const latestSnapshot = this.getUuidFromUri(
      this.args.publicService.concept.get('hasLatestFunctionalChange')
    );
    const publicServiceSnapshot = this.getUuidFromUri(
      this.args.publicService.versionedSource
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

  @action
  unlinkConcept() {
    this.args.onUnlinkConcept();
    this.hideUnlinkWarning();
  }

  @action
  markAsReviewed() {
    this.args.onMarkAsReviewed();
  }

  getUuidFromUri(uri) {
    const segmentedUri = uri.split('/');
    return segmentedUri[segmentedUri.length - 1];
  }
}
