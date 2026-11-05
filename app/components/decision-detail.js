import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import DOMPurify from 'dompurify';
import { htmlSafe } from '@ember/template';
import { action } from '@ember/object';
import DecisionLinkingModalComponent from 'frontend-lpdc/components/decision-linking-modal';

export default class DecisionsDetailComponent extends Component {
  @service modals;
  @tracked selected = this.args.decisions?.[0];

  @action
  linkDecision() {
    this.modals.open(DecisionLinkingModalComponent, {
      publicService: this.args.publicService,
    });
  }

  @action
  selectDecision(decision) {
    this.selected = decision;
  }

  get sanitizedHtml() {
    return htmlSafe(
      DOMPurify.sanitize(this.selected.extractedHtml, {
        ALLOWED_TAGS: [
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'p',
          'br',
          'strong',
          'em',
          'b',
          'i',
          'u',
          'ul',
          'ol',
          'li',
          'dl',
          'dt',
          'dd',
          'table',
          'thead',
          'tbody',
          'tr',
          'th',
          'td',
          'caption',
          'figure',
          'figcaption',
          'blockquote',
          'pre',
          'code',
          'div',
          'span',
        ],
        ALLOWED_ATTR: ['colspan', 'rowspan'],
      }),
    );
  }
}
