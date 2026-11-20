import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { dropTask, task } from 'ember-concurrency';
import { USAGE_STATUS } from 'frontend-lpdc/models/generation-activity';

export default class HeerlijkHelderModalComponent extends Component {
  @service heerlijkHelder;
  @service router;

  @tracked firstOriginal; // text before any generation(s), shown on the left
  @tracked activity; // the current generation-activity
  @tracked activities = [];
  @tracked draft; // text on the right, editable by the user
  @tracked error = null;
  @tracked editorController; // only for rich text fields

  publicServiceId = this.router.currentRoute.parent.params.serviceId;
  subject = this.args.data.subject;
  predicate = this.args.data.predicate;
  originalValue = this.args.data.originalValue;

  constructor() {
    super(...arguments);
    this.firstOriginal = this.originalValue;
    this.loadOrGenerate.perform();
  }

  loadOrGenerate = task(async () => {
    this.error = null;
    try {
      this.activities = await this.heerlijkHelder.getGenerationActivities(
        this.publicServiceId,
        this.subject,
        this.predicate,
      );
      this.firstOriginal =
        this.activities[0]?.originalText ?? this.originalValue;

      const latest = this.activities.at(-1);
      // 1. a generation is still running for this field
      if (latest && !latest.generatedText) {
        try {
          await this.heerlijkHelder.pollTask(latest.id);
          await latest.reload();
          this.show(latest);
          return;
        } catch (e) {
          console.error('Error while fetching latest generation:', e);
        }
      }

      // 2. the latest used attempt, otherwise the latest successful attempt
      const done = this.activities.filter((a) => a.generatedText);
      const usedOrLatestGeneration =
        done.findLast((a) => a.usageStatus === USAGE_STATUS.USED) ??
        done.at(-1);
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
      const activity = await this.heerlijkHelder.generate({
        data: {
          type: 'generation-activities',
          attributes: {
            'original-text': this.originalValue,
            'related-subject': this.subject,
            'related-field': this.predicate,
          },
          relationships: {
            'public-service': {
              data: { type: 'public-services', id: this.publicServiceId },
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
      !this.error &&
      (this.isEdited || this.previousActivity)
    );
  }

  get previousActivity() {
    if (!this.activity) return null;
    return this.activities
      .filter((a) => a.generatedText)
      .filter((a) => a.attemptNumber < this.activity.attemptNumber)
      .at(-1);
  }

  @action
  close() {
    this.args.close();
  }

  save = dropTask(async () => {
    this.activity.finalText = this.draft;
    this.activity.usageStatus = USAGE_STATUS.USED;
    await this.activity.save();
    this.args.close({ text: this.draft });
  });

  @action
  initEditor(controller) {
    // the editor is rendered again after every generation, with the new draft
    this.editorController = controller;
    this.loadIntoEditor();
  }

  loadIntoEditor() {
    this.editorController.initialize(this.draft ?? '', { shouldFocus: false });
  }

  @action
  updateDraftFromEditor() {
    if (this.editorController?.isDirty)
      this.draft = this.editorController.htmlContent;
  }

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
    if (this.editorController) this.loadIntoEditor();
  }

  @action
  rateRewrite(value) {
    if (!this.activity) return;
    this.activity.isImproved =
      this.activity.isImproved === value ? null : value;
    this.activity.save();
  }
}
