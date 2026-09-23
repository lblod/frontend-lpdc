import Model, { attr } from '@warp-drive/legacy/model';

export default class FormalInformalChoice extends Model {
  @attr chosenForm;
  @attr dateCreated;
  @attr uri;
}
