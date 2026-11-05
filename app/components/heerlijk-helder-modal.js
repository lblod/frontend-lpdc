import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class HeerlijkHelderModalComponent extends Component {
  @service heerlijkHelder;

  @tracked isImproved;
  @tracked generation;
  publicService = this.args.data.publicService;
  subject = this.args.data.subject;
  predicate = this.args.data.predicate;
  originalValue = this.args.data.originalValue;

  constructor() {
    super(...arguments);
    this.loadOrGenerate.perform();
  }

  loadOrGenerate = task(async () => {
    const key = this.heerlijkHelder.keyForGeneration(
      this.subject,
      this.predicate,
    );
    console.log('PENDING?', this.heerlijkHelder.pendingGeneration(key));
    const promise =
      this.heerlijkHelder.pendingGeneration(key) ??
      this.heerlijkHelder.generate(key, {
        data: {
          type: 'generation-activities',
          attributes: {
            'original-text': this.originalValue,
            'related-subject': this.subject,
            'related-field': this.predicate,
          },
          relationships: {
            'public-service': {
              data: { type: 'public-services', id: this.publicService.id },
            },
          },
        },
      });

    try {
      console.log('PROMISE', promise);
      const response = await promise;
      this.generation = response.data.attributes['generated-text']; //TODO: should be written in the database, reload and fetch fom there
      console.log('Generation result:', this.generation);
    } catch (error) {
      console.error('Error generating rewrite:', error);
      this.generation = 'error';
    }
  });

  willDestroy() {
    super.willDestroy(...arguments);
  }

  @action
  close() {
    this.args.close();
  }

  @action
  save() {
    this.close();
  }

  @action
  updateGeneration(event) {
    this.generation = event.target.value;
  }

  @action
  regenerate() {
    this.generation = null;
    this.loadOrGenerate.perform();
  }

  @action
  rateRewrite(value) {
    this.isImproved = this.isImproved === value ? null : value;
  }
}
