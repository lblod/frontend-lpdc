import Model, { attr } from '@warp-drive/legacy/model';

export default class ConceptDisplayConfigurationModel extends Model {
  @attr uri;
  @attr isNewConcept;
  @attr isInstantiated;
}
