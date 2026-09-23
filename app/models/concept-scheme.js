import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class ConceptSchemeModel extends Model {
  @attr uri;
  @attr label;
  @hasMany('concept', {
    async: true,
    inverse: null,
  })
  concepts;
  @hasMany('concept', {
    async: true,
    inverse: null,
  })
  topConcepts;
}
