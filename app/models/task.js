import Model, { attr, belongsTo, hasMany } from '@warp-drive/legacy/model';

export default class TaskModel extends Model {
  @attr uri;
  @attr status;
  @attr('date') created;
  @attr('date') modified;
  @attr operation;
  @attr index;

  @belongsTo('job-error', { async: true, inverse: null }) error;
  @belongsTo('job', { async: true, inverse: 'tasks' }) job;

  @hasMany('task', { async: true, inverse: null }) parentTasks;

  //Due to lack of inheritance in mu-cl-resource, we directly link to file and collection, stuff we need here.
  @hasMany('data-container', { async: true, inverse: null }) resultsContainers;
  @hasMany('data-container', { async: true, inverse: null }) inputContainers;
}

export const TASK_STATUS = {
  BUSY: 'http://redpencil.data.gift/id/concept/JobStatus/busy',
  SCHEDULED: 'http://redpencil.data.gift/id/concept/JobStatus/scheduled',
  SUCCESS: 'http://redpencil.data.gift/id/concept/JobStatus/success',
  FAILED: 'http://redpencil.data.gift/id/concept/JobStatus/failed',
  CANCELED: 'http://redpencil.data.gift/id/concept/JobStatus/canceled',
};
