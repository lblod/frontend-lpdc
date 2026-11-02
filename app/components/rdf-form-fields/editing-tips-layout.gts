import AuContent from '@appuniversum/ember-appuniversum/components/au-content';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import Component from '@glimmer/component';
import { and, not } from 'ember-truth-helpers';
import { NamedNode } from 'rdflib';
import type { EditorTipsFieldArgs } from './types';

interface Signature {
  Args: EditorTipsFieldArgs;
  Blocks: {
    default: [];
  };
  Element: HTMLDivElement;
}

export default class EditingTipsLayout extends Component<Signature> {
  get helpText() {
    return this.isLinkedToConcept
      ? this.args.field.options.conceptHelpText
      : this.args.field.options.helpText;
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

  <template>
    <div class="au-o-grid au-o-grid--flush" ...attributes>
      <div class="au-o-grid__item au-u-2-3 {{if @show 'au-u-flex-grow'}}">
        {{yield}}
      </div>

      {{#if (and this.helpText (not @show))}}
        <div
          class="au-o-grid__item au-u-muted au-u-1-3 au-u-flex au-u-flex--row"
        >
          <AuIcon
            @icon="info-circle"
            @size="large"
            class="au-u-margin-left-small au-u-margin-right-small au-u-flex-shrink-0"
          />
          <AuContent>
            <AuHelpText
              @size="normal"
              @skin="secondary"
              class="au-u-margin-top-none"
            >
              {{! template-lint-disable no-triple-curlies }}
              {{{this.helpText}}}
            </AuHelpText>
          </AuContent>
        </div>
      {{/if}}
    </div>
  </template>
}
