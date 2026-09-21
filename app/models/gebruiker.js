import Model, { attr, hasMany, belongsTo } from '@warp-drive/legacy/model';

export default class GebruikerModel extends Model {
  @attr voornaam;
  @attr achternaam;
  @attr mailAdres;
  @hasMany('account', {
    async: true,
    inverse: null,
  })
  account;
  @hasMany('bestuurseenheid', {
    async: true,
    inverse: null,
  })
  bestuurseenheden;
  @belongsTo('notification-preference', {
    async: true,
    inverse: 'gebruiker',
  })
  notificationPreference;

  get group() {
    return this.hasMany('bestuurseenheden').value()?.[0];
  }

  // used for mock login
  get fullName() {
    return `${this.voornaam} ${this.achternaam}`.trim();
  }
}
