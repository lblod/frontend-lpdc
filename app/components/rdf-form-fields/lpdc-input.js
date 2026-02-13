import SimpleInputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/simple-value-input-field';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';
import { NamedNode } from 'rdflib';

export default class LpdcInputComponent extends SimpleInputFieldComponent {
  inputId = 'input-' + guidFor(this);

  get helpText() {
    return this.isLinkedToConcept
      ? this.args.field.options.conceptHelpText
      : this.args.field.options.helpText;
  }

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

  get isLinkedToConcept() {
    const { formStore, sourceNode, graphs } = this.args;

    // Check if there's a concept linked via dct:source
    const conceptLink = formStore.any(
      sourceNode,
      new NamedNode('http://purl.org/dc/terms/source'),
      undefined,
      graphs.sourceGraph,
    );

    return !!conceptLink;
  }
}
