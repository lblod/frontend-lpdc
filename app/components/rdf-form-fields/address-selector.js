import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { updateSimpleFormValue } from '@lblod/submission-form-helpers';
import { action } from '@ember/object';
import { Literal, NamedNode } from 'rdflib';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import { HttpRequest } from 'frontend-lpdc/helpers/http-request';

export default class AddressSelectorComponent extends InputFieldComponent {
  id = '-' + guidFor(this);
  @tracked municipality;
  @tracked street;
  @tracked houseNumber;
  @tracked busNumber;
  @tracked adresMatchFound;

  @service toaster;
  httpRequest = new HttpRequest(this.toaster);

  initialObjectMunicipality;
  initialObjectPostcode;
  initialObjectStreet;
  initialObjectHouseNumber;
  initialObjectBusNumber;
  initialObjectCountry;
  initialObjectAdresId;

  constructor() {
    super(...arguments);

    this.loadProvidedValue();
    this.validateAddress.perform(false);
  }

  loadProvidedValue() {
    const store = this.storeOptions.store;

    const triples = store.match(
      this.storeOptions.sourceNode,
      undefined,
      undefined,
      undefined,
    );

    this.initialObjectMunicipality = triples.find(
      (triple) => triple.predicate.value === predicates.municipality,
    )?.object;
    this.municipality = this.initialObjectMunicipality?.value;
    this.initialObjectPostcode = triples.find(
      (triple) => triple.predicate.value === predicates.postcode,
    )?.object;
    this.initialObjectStreet = triples.find(
      (triple) => triple.predicate.value === predicates.street,
    )?.object;
    this.street = this.initialObjectStreet?.value;
    this.initialObjectHouseNumber = triples.find(
      (triple) => triple.predicate.value === predicates.houseNumber,
    )?.object;
    this.houseNumber = this.initialObjectHouseNumber?.value;
    this.initialObjectBusNumber = triples.find(
      (triple) => triple.predicate.value === predicates.busNumber,
    )?.object;
    this.busNumber = this.initialObjectBusNumber?.value;
    this.initialObjectCountry = triples.find(
      (triple) => triple.predicate.value === predicates.country,
    )?.object;
    this.initialObjectAdresId = triples.find(
      (triple) => triple.predicate.value === predicates.hasAdresId,
    )?.object;
  }

  get canValidateAddress() {
    return !!this.municipality && !!this.street && !!this.houseNumber;
  }

  get canUpdateStreet() {
    return !this.args.show && !!this.municipality;
  }

  get canUpdateHouseNumber() {
    return !this.args.show && !!this.municipality && !!this.street;
  }

  get canUpdateBusNumber() {
    return (
      !this.args.show &&
      !!this.municipality &&
      !!this.street &&
      !!this.houseNumber
    );
  }

  get isMunicipalityMerger() {
    const isMunicipalityMerger = this.args.formStore.match(
      undefined,
      new NamedNode(
        'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#forMunicipalityMerger',
      ),
      undefined,
      this.args.formStore.sourceGraph,
    )[0].object.value;

    return isMunicipalityMerger === '1';
  }

  @action
  updateMunicipality(value) {
    this.municipality = this.powerSelectOrInput(value);
    this.updateStreet(null);
    this.updateHouseNumber(null);
    this.updateBusNumber(null);
    this.updateMunicipalityTriple();
    this.validateAddress.perform();
  }

  @action
  updateStreet(value) {
    this.street = this.powerSelectOrInput(value);
    this.updateHouseNumber(null);
    this.updateBusNumber(null);
    this.updateStreetTriple();
    this.validateAddress.perform();
  }

  @action
  updateHouseNumber(event) {
    const value = event && event.target.value;
    this.houseNumber = value && value.trim();
    this.updateBusNumber(null);
    this.updateHouseNumberTriple();
    this.validateAddress.perform();
  }

  @action
  updateBusNumber(event) {
    const value = event && event.target.value;
    this.busNumber = value && value.trim();
    this.updateBusNumberTriple();
    this.validateAddress.perform();
  }

  @restartableTask
  *validateAddress(updateTriples = true) {
    yield timeout(250);
    const result = yield this.performValidateAddress();
    this.adresMatchFound = !!result.adressenRegisterId;
    if (updateTriples) {
      this.adresMatchFound
        ? this.updatePostcodeTriple(result.postcode)
        : this.updateCountryTriple(null);
      this.adresMatchFound
        ? this.updateCountryTriple()
        : this.updatePostcodeTriple(null);
      this.adresMatchFound
        ? this.updateAddressRegisterIdTriple(result.adressenRegisterId)
        : this.updateAddressRegisterIdTriple(null);
    }
  }

  async performValidateAddress() {
    if (this.municipality && this.street && this.houseNumber) {
      const busNumberQueryParam = this.busNumber
        ? `&busNumber=${this.busNumber}`
        : '';
      const queryParams = `municipality=${this.municipality}&street=${this.street}&houseNumber=${this.houseNumber}${busNumberQueryParam}`;
      return this.httpRequest.get(
        `/lpdc-management/address/validate?${queryParams}`,
      );
    } else {
      return {};
    }
  }

  @restartableTask
  *searchMunicipalities(searchString) {
    yield timeout(250);
    return this.httpRequest.get(
      `/lpdc-management/address/municipalities?search=${searchString.trim()}`,
    );
  }

  @restartableTask
  *searchStreets(searchString) {
    yield timeout(250);
    const trimmedSearchString = searchString.trim();
    return this.httpRequest.get(
      `/lpdc-management/address/streets?municipality=${this.municipality}&search=${trimmedSearchString}`,
    );
  }

  updateMunicipalityTriple() {
    const newObject = this.createObjectFromValue(this.municipality, 'nl');
    this.updateField(
      predicates.municipality,
      newObject,
      this.initialObjectMunicipality,
    );
    this.initialObjectMunicipality = newObject;
  }

  updatePostcodeTriple(postcode) {
    const newObject = this.createObjectFromValue(postcode);
    this.updateField(
      predicates.postcode,
      newObject,
      this.initialObjectPostcode,
    );
    this.initialObjectPostcode = newObject;
  }

  updateStreetTriple() {
    const newObject = this.createObjectFromValue(this.street, 'nl');
    this.updateField(predicates.street, newObject, this.initialObjectStreet);
    this.initialObjectStreet = newObject;
  }

  updateHouseNumberTriple() {
    const newObject = this.createObjectFromValue(this.houseNumber);
    this.updateField(
      predicates.houseNumber,
      newObject,
      this.initialObjectHouseNumber,
    );
    this.initialObjectHouseNumber = newObject;
  }

  updateBusNumberTriple() {
    const newObject = this.createObjectFromValue(this.busNumber);
    this.updateField(
      predicates.busNumber,
      newObject,
      this.initialObjectBusNumber,
    );
    this.initialObjectBusNumber = newObject;
  }

  updateCountryTriple(country = 'België') {
    const newObject = this.createObjectFromValue(country, 'nl');
    this.updateField(predicates.country, newObject, this.initialObjectCountry);
    this.initialObjectCountry = newObject;
  }

  updateAddressRegisterIdTriple(addressRegisterId) {
    const newObject = addressRegisterId
      ? new NamedNode(addressRegisterId)
      : null;
    this.updateField(
      predicates.hasAdresId,
      newObject,
      this.initialObjectAdresId,
    );
    this.initialObjectAdresId = newObject;
  }

  updateField(path, newObject, originalObject) {
    const storeOptions = {
      ...this.storeOptions,
      path: new NamedNode(path),
    };
    updateSimpleFormValue(storeOptions, newObject, originalObject);
  }
  createObjectFromValue(value, language) {
    return value ? new Literal(value, language) : null;
  }

  powerSelectOrInput(value) {
    return value instanceof InputEvent ? value.target.value : value;
  }
}

const predicates = {
  municipality: 'https://data.vlaanderen.be/ns/adres#gemeentenaam',
  postcode: 'https://data.vlaanderen.be/ns/adres#postcode',
  street: 'https://data.vlaanderen.be/ns/adres#Straatnaam',
  houseNumber:
    'https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer',
  busNumber: 'https://data.vlaanderen.be/ns/adres#Adresvoorstelling.busnummer',
  country: 'https://data.vlaanderen.be/ns/adres#land',
  hasAdresId: 'https://data.vlaanderen.be/ns/adres#verwijstNaar',
};
