import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-lpdc/tests/helpers';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const ELEMENTS = {
  FORMAL_ALERT: '[data-test-reminder-u-or-je-choice=formal]',
  INFORMAL_ALERT: '[data-test-reminder-u-or-je-choice=informal]',
  NO_CHOICE_ALERT: '[data-test-reminder-u-or-je-choice=no-choice]',
  MAKE_CHOICE_LINK: '[data-test-reminder-u-or-je-choice=make-choice-link]',
};

module('Integration | Component | reminder-u-or-je-choice', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<ReminderUOrJeChoice />`);

    assert.dom(this.element).exists();
  });

  test('when chosenForm informal then informal alert should be rendered', async function (assert) {
    await render(hbs`<ReminderUOrJeChoice @chosenForm="informal" />`);

    assert.dom(ELEMENTS.INFORMAL_ALERT).exists();
  });

  test('when chosenForm formal then formal alert should be rendered', async function (assert) {
    await render(hbs`<ReminderUOrJeChoice @chosenForm="formal" />`);

    assert.dom(ELEMENTS.FORMAL_ALERT).exists();
  });

  test('when no chosenForm then no choice alert should be rendered', async function (assert) {
    await render(hbs`<ReminderUOrJeChoice @chosenForm={{undefined}} />`);

    assert.dom(ELEMENTS.NO_CHOICE_ALERT).exists();
  });

  test('when make choice is clicked then openSelectModal function is called', async function (assert) {
    this.openSelectModalFn = () => assert.step('make choice later clicked');
    await render(
      hbs`<ReminderUOrJeChoice @chosenForm={{undefined}} @openSelectModal={{this.openSelectModalFn}} />`,
    );

    assert.dom(ELEMENTS.NO_CHOICE_ALERT).exists();
    const link = document.querySelector(ELEMENTS.MAKE_CHOICE_LINK);
    await click(link);

    assert.verifySteps(['make choice later clicked']);
  });
});
