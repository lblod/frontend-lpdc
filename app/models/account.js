import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class AccountModel extends Model {
  @attr voId;
  @attr provider;
  @belongsTo('gebruiker', {
    async: false,
    inverse: null,
  })
  gebruiker;
}
