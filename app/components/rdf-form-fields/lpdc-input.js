import SimpleInputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/simple-value-input-field';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';

export default class LpdcInputComponent extends SimpleInputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @action
  updateValue(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    this.updateValueInStore([e.target.value.trim()]);
  }

  @action
  updateValueInStore(values) {
    this.value = values[0] || '';
    super.updateValue(this.value);
  }
}
