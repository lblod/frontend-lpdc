import Model, { attr } from '@ember-data/model';

/** This is duplicate of `rol` model but written in english */
export default class RolModel extends Model {
  @attr label;
}
