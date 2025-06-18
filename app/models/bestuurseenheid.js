import Model, { attr, belongsTo } from '@ember-data/model';

export default class Bestuurseenheid extends Model {
  @attr uri;
  @attr naam;
  @attr alternatieveNaam;

  @belongsTo('bestuurseenheid-classificatie-code', {
    async: false,
    inverse: null,
  })
  classificatie;

  rdfaBindings = {
    naam: 'http://www.w3.org/2004/02/skos/core#prefLabel',
    class: 'http://data.vlaanderen.be/ns/besluit#Bestuurseenheid',
    classificatie: 'http://data.vlaanderen.be/ns/besluit#classificatie',
  };
}
