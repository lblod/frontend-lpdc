import Model, { attr, hasMany } from '@ember-data/model';

export default class ConceptModel extends Model {
  @attr uri;
  @attr label;
  @attr order;
  @hasMany('concept-scheme', {
    async: true,
    inverse: null,
  })
  conceptSchemes;
  @hasMany('concept-scheme', {
    async: true,
    inverse: null,
  })
  topConceptSchemes;
}
