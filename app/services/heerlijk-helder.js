import Service, { service } from '@ember/service';
import { HttpRequest } from '../helpers/http-request';
import { timeout } from 'ember-concurrency';
import { TASK_STATUS } from 'frontend-lpdc/models/task';

export default class HeerlijkHelderService extends Service {
  @service store;
  @service toaster;
  httpRequest = new HttpRequest(this.toaster);

  async generate(payload) {
    const response = await this.httpRequest.post('/hh-rewrites', payload, {
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
    });
    await this.pollTask(response.id);

    return await this.store.findRecord('generation-activity', response.id, {
      reload: true,
    });
  }

  async pollTask(id) {
    const task = await this.store.findRecord('task', id, { reload: true });
    const deadline = Date.now() + 3 * 60 * 1000; // poll tasks no longer than 3 min
    while (
      task.status === TASK_STATUS.SCHEDULED ||
      task.status === TASK_STATUS.BUSY
    ) {
      if (Date.now() > deadline) throw new Error('Heerlijk helder timed out');
      await timeout(1000);
      await task.reload();
    }
    if (task.status !== TASK_STATUS.SUCCESS) {
      throw new Error(`Heerlijk Helder task ended with status ${task.status}`);
    }
  }

  async isRunning(id) {
    const task = await this.store.findRecord('task', id, { reload: true });
    return (
      task.status === TASK_STATUS.SCHEDULED || task.status === TASK_STATUS.BUSY
    );
  }

  async pollRunning(activity) {
    if (!activity || activity.generatedText) return null;
    if (!(await this.isRunning(activity.id))) return null;
    await this.pollTask(activity.id);
    return await activity.reload();
  }

  async getGenerationActivities(publicServiceId, subject, predicate) {
    const activities = await this.store.query('generation-activity', {
      filter: {
        'field-generation': {
          instance: { ':id:': publicServiceId },
          ':exact:related-subject': subject,
          ':exact:related-field': predicate,
        },
      },
      sort: 'attempt-number',
    });
    return [...activities];
  }
}
