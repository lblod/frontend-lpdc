import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { dropTask, task } from 'ember-concurrency';
import { STATUS } from 'frontend-lpdc/models/generation-activity';

export default class HeerlijkHelderModalComponent extends Component {
  @service heerlijkHelder;

  @tracked firstOriginal; // text before any generation(s), shown on the left
  @tracked activity; // the current generation-activity
  @tracked activities = [];
  @tracked draft; // text on the right, editable by the user
  @tracked error = null;

  publicService = this.args.data.publicService;
  subject = this.args.data.subject;
  predicate = this.args.data.predicate;
  originalValue = this.args.data.originalValue;
  key = this.heerlijkHelder.keyForGeneration(this.subject, this.predicate);

  constructor() {
    super(...arguments);
    this.firstOriginal = this.originalValue;
    this.loadOrGenerate.perform();
  }

  loadOrGenerate = task(async () => {
    this.error = null;
    try {
      this.activities = await this.heerlijkHelder.getGenerationActivities(
        this.publicService,
        this.subject,
        this.predicate,
      );
      this.firstOriginal =
        this.activities[0]?.originalText ?? this.originalValue;

      // 1. a generation is still running for this field
      const running = this.heerlijkHelder.pendingGeneration(this.key);
      if (running) {
        this.show(await running);
        return;
      }

      // 2. the latest used attempt, otherwise the latest attempt
      const usedOrLatestGeneration =
        this.activities.findLast((a) => a.status === STATUS.GEBRUIKT) ??
        this.activities.at(-1);
      if (usedOrLatestGeneration) {
        this.show(usedOrLatestGeneration);
        return;
      }
    } catch (error) {
      console.error('Error loading rewrite:', error);
      this.error = error;
      return;
    }

    // 3. nothing yet, generate the first attempt
    await this.generate.perform();
  });

  generate = task(async () => {
    this.error = null;
    try {
      const activity = await this.heerlijkHelder.generate(this.key, {
        data: {
          type: 'generation-activities',
          attributes: {
            // retries rewrite the same original, not the text in the field
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
      this.activities = [...this.activities, activity];
      this.show(activity);
    } catch (error) {
      console.error('Error generating rewrite:', error);
      this.error = error;
    }
  });

  show(activity) {
    this.activity = activity;
    this.draft = activity.finalText ?? activity.generatedText;
  }

  get isBusy() {
    return this.loadOrGenerate.isRunning || this.generate.isRunning;
  }

  get hasChanges() {
    return (this.draft ?? '').trim() !== (this.originalValue ?? '').trim();
  }

  get isEdited() {
    return this.draft.trim() !== this.activity.generatedText.trim();
  }

  get canSave() {
    return (
      !this.isBusy &&
      !this.save.isRunning &&
      !this.error &&
      this.activity &&
      this.draft?.trim() &&
      this.hasChanges
    );
  }

  get canRevert() {
    return (
      !this.isBusy &&
      !this.save.isRunning &&
      (this.isEdited || this.previousActivity)
    );
  }

  get previousActivity() {
    if (!this.activity) return null;
    return this.activities
      .filter((a) => a.attemptNumber < this.activity.attemptNumber)
      .at(-1);
  }

  @action
  close() {
    this.args.close();
  }

  save = dropTask(async () => {
    this.activity.finalText = this.draft;
    this.activity.status = STATUS.GEBRUIKT;
    await this.activity.save();
    this.args.close({ text: this.draft });
  });

  @action
  updateDraft(event) {
    this.draft = event.target.value;
  }

  @action
  revertGeneration() {
    if (this.isEdited) {
      this.draft = this.activity.generatedText;
    } else if (this.previousActivity) {
      this.show(this.previousActivity);
    }
  }

  @action
  rateRewrite(value) {
    if (!this.activity) return;
    this.activity.isImproved =
      this.activity.isImproved === value ? null : value;
    this.activity.save();
  }
}
