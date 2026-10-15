import AuFieldset from '@appuniversum/ember-appuniversum/components/au-fieldset';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';
import { uniqueId } from '@ember/helper';
import { action } from '@ember/object';
import type Owner from '@ember/owner';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import {
  triplesForPath,
  updateSimpleFormValue,
  removeDatasetForSimpleFormValue,
} from '@lblod/submission-form-helpers';
import EditingTipsLayout from './editing-tips-layout';
import type {
  EditorTipsFieldArgs,
  Options,
  SemanticFormFieldArgs,
} from './types';
import { assert } from '@ember/debug';
import { isLiteral, Literal } from 'rdflib';

interface Signature {
  Args: EditorTipsFieldArgs;
}

const OPTIONS = {
  YES: 'yes',
  NO: 'no',
  NO_INFO: 'no-info',
} as const;

export default class LpdcConfirmRadios extends Component<Signature> {
  @tracked selected: string = OPTIONS.NO_INFO;

  constructor(owner: Owner, args: Signature['Args']) {
    super(owner, args);

    this.loadProvidedValue();
  }

  get isEditMode() {
    return !this.args.show;
  }

  loadProvidedValue() {
    const matches = triplesForPath(storeOptions(this.args));

    if (matches.values.length > 0) {
      const object = matches.values.at(0);
      if (isLiteral(object)) {
        const value = Literal.toJS(object);
        assert(
          'The stored value is expected to be a boolean',
          typeof value === 'boolean',
        );

        this.selected = value ? OPTIONS.YES : OPTIONS.NO;
      }
    }
  }

  @action
  updateValue(newSelection?: string) {
    assert(
      'selected is expected to be set here since we provide values for all options',
      typeof newSelection === 'string',
    );

    const newValue = optionToValue(newSelection);
    const oldValue = optionToValue(this.selected);
    const options = storeOptions(this.args);

    if (newSelection === OPTIONS.NO_INFO) {
      removeDatasetForSimpleFormValue(oldValue, options);
    } else {
      updateSimpleFormValue(options, newValue, oldValue);
    }

    this.selected = newSelection;
  }

  <template>
    {{#let (uniqueId) as |fieldId|}}
      <AuFieldset as |f|>
        <f.legend>
          {{@field.label}}
        </f.legend>

        <f.content class="au-u-1-1">
          <EditingTipsLayout
            @formStore={{@formStore}}
            @graphs={{@graphs}}
            @sourceNode={{@sourceNode}}
            @field={{@field}}
            @show={{@show}}
          >
            <AuRadioGroup
              @name="lpdc-confirm-radios-{{fieldId}}"
              @selected={{this.selected}}
              @onChange={{this.updateValue}}
              @disabled={{@show}}
              as |Group|
            >
              <Group.Radio @value={{OPTIONS.YES}}>Ja</Group.Radio>
              <Group.Radio @value={{OPTIONS.NO}}>Nee</Group.Radio>
              <Group.Radio @value={{OPTIONS.NO_INFO}}>Geen informatie</Group.Radio>
            </AuRadioGroup>
          </EditingTipsLayout>
        </f.content>
      </AuFieldset>
    {{/let}}
  </template>
}

/**
 * Builds the "storeOptions" object that a lot of form helper utils expect
 */
function storeOptions(args: SemanticFormFieldArgs<unknown>): Options {
  return {
    formGraph: args.graphs.formGraph,
    sourceGraph: args.graphs.sourceGraph,
    metaGraph: args.graphs.metaGraph,
    sourceNode: args.sourceNode,
    store: args.formStore,
    path: args.field.rdflibPath,
    scope: args.field.rdflibScope,
  };
}

function optionToValue(option: string): Literal | undefined {
  if (option === OPTIONS.NO_INFO) {
    return undefined;
  }

  return Literal.fromBoolean(option === OPTIONS.YES);
}
