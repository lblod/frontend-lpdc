import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { triplesForPath } from '@lblod/submission-form-helpers';

export default class AddressSelectorComponent extends InputFieldComponent {
  country;
  municipality;
  postcode;
  street;
  houseNumber;
  busNumber;

  constructor() {
    super(...arguments);

    this.loadProvidedValue();
  }

  loadProvidedValue() {
    console.log(this.storeOptions.sourceNode.value);
    const store = this.storeOptions.store;

    const triples = store.match(
      this.storeOptions.sourceNode,
      undefined,
      undefined,
      undefined
    );

    console.log(triples);

    this.country = triples.find(
      (triple) =>
        triple.predicate.value === 'https://data.vlaanderen.be/ns/adres#land'
    )?.object.value;
    this.municipality = triples.find(
      (triple) =>
        triple.predicate.value ===
        'https://data.vlaanderen.be/ns/adres#gemeentenaam'
    )?.object.value;
    this.postcode = triples.find(
      (triple) =>
        triple.predicate.value ===
        'https://data.vlaanderen.be/ns/adres#postcode'
    )?.object.value;
    this.street = triples.find(
      (triple) =>
        triple.predicate.value ===
        'https://data.vlaanderen.be/ns/adres#Straatnaam'
    )?.object.value;
    this.houseNumber = triples.find(
      (triple) =>
        triple.predicate.value ===
        'https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer'
    )?.object.value;
    this.busNumber = triples.find(
      (triple) =>
        triple.predicate.value ===
        'https://data.vlaanderen.be/ns/adres#Adresvoorstelling.busnummer'
    )?.object.value;

    const matches = triplesForPath(this.storeOptions);
    console.log(matches);
  }
}
