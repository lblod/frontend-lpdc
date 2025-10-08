import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import SimpleInputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/simple-value-input-field';
import { guidFor } from '@ember/object/internals';
import { task } from 'ember-concurrency';
import { HttpRequest } from 'frontend-lpdc/helpers/http-request';
import { inject as service } from '@ember/service';

export default class SelectWithCreateComponent extends SimpleInputFieldComponent {
  @tracked
  options = [];
  id = 'select-with-create-' + guidFor(this);
  @service toaster;

  httpRequest = new HttpRequest(this.toaster);

  constructor() {
    super(...arguments);
    this.loadOptions.perform();
  }

  @action
  createSuggestion(value) {
    return `Voeg '${value.trim()}' toe`;
  }

  @action
  createOption(newOption) {
    const options = [...this.options, newOption.trim()];
    this.options = Array.from(new Set(options));
    this.value = newOption.trim();
    this.updateStore();
  }

  @action
  showCreateWhen(term) {
    if (term.trim().length === 0) {
      return false;
    }

    const optionAlreadyExists = this.options.some((option) => option === term);

    return !optionAlreadyExists;
  }

  @action
  updateOption(newOption) {
    this.value = newOption;
    this.updateStore();
  }

  @task
  *loadOptions() {
    const field = this.storeOptions.path.value.split('http://schema.org/')[1];
    this.options = yield this.httpRequest.get(
      `/lpdc-management/contact-info-options/${field}`,
    );
  }

  updateStore() {
    super.updateValue(this.value);
  }
}
