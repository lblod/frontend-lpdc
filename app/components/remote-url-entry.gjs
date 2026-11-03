import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { modifier } from 'ember-modifier';
import { trackedArray } from '@ember/reactive/collections';
import isURL from 'validator/lib/isURL.js';
import { removeItem } from 'frontend-lpdc/utils/array';
import LinkStatusPill from './link-status-pill';

const autofocus = modifier((element) => element.focus());

function isValidUrl(value) {
  return isURL(value, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
  });
}

class UrlEntry {
  @tracked source = '';

  get hasError() {
    return !!this.source && !isValidUrl(this.source);
  }

  get isValid() {
    return !!this.source && !this.hasError;
  }
}

export default class RemoteUrlEntryComponent extends Component {
  entries = new trackedArray([]);

  @action
  addEntry() {
    this.entries.push(new UrlEntry());
  }

  @action
  removeEntry(entry) {
    removeItem(this.entries, entry);
    this.notifyChange();
  }

  @action
  async updateEntry(entry, event) {
    const source = event.target.value.trim();
    entry.source = source;
    this.notifyChange();
  }

  notifyChange() {
    this.args.onChange?.({
      urls: this.entries.filter((e) => e.isValid).map((e) => e.source),
      hasErrors: this.entries.some((e) => e.hasError),
    });
  }

  <template>
    {{#if this.entries}}
      <ul class="au-o-flow au-o-flow--tiny">
        {{#each this.entries as |entry|}}
          <li class="au-c-card au-o-box au-o-box--small">
            <AuInput
              @width="block"
              @error={{entry.hasError}}
              value={{entry.source}}
              placeholder="http://www.uw-bestuur.be/specifiek-document"
              {{on "blur" (fn this.updateEntry entry)}}
              {{autofocus}}
            />

            <div class="au-u-flex au-u-margin-top-tiny">
              {{#if entry.isValid}}
                <AuLinkExternal
                  @icon="external-link"
                  @iconAlignment="left"
                  href={{entry.source}}
                >
                  Test&nbsp;link
                </AuLinkExternal>
              {{/if}}
              <AuButton
                @skin="link"
                @icon="bin"
                @iconAlignment="left"
                {{on "click" (fn this.removeEntry entry)}}
              >
                Verwijder&nbsp;link
              </AuButton>
              {{#if entry.isValid}}
                <LinkStatusPill @url={{entry.source}} />
              {{/if}}
            </div>

            {{#if entry.hasError}}
              <AuHelpText @error={{true}}>
                Dit is geen geldige link. Gebruik een volledige URL,
                bijvoorbeeld https://www.voorbeeld.be/document
              </AuHelpText>
            {{/if}}
          </li>
        {{/each}}
      </ul>
    {{/if}}

    <div class="au-u-margin-top au-u-text-center">
      {{#unless this.entries}}
        <AuHelpText class="au-u-margin-bottom-tiny">
          Nog geen links toegevoegd.
        </AuHelpText>
      {{/unless}}
      <AuButton
        @icon="plus"
        @iconAlignment="left"
        class="au-u-margin-bottom-tiny"
        {{on "click" this.addEntry}}
      >
        Voeg nieuwe link toe
      </AuButton>
      <AuHelpText class="au-u-margin-top-tiny">
        Enkel links naar specifieke documenten, geen overzichtspagina's.
      </AuHelpText>
    </div>
  </template>
}
