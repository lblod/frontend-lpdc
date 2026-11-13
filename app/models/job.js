import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class JobModel extends Model {
  @attr uri;
  @attr status;
  @attr('date') created;
  @attr('date') modified;
  @attr subject;
  @attr creator;
  @attr operation;

  // @belongsTo('job-error', { async: true, inverse: null }) error;
  @hasMany('task', { async: true, inverse: 'job' }) tasks;
}

export const JOB_STATUS = {
  BUSY: 'http://redpencil.data.gift/id/concept/JobStatus/busy',
  SCHEDULED: 'http://redpencil.data.gift/id/concept/JobStatus/scheduled',
  SUCCESS: 'http://redpencil.data.gift/id/concept/JobStatus/success',
  FAILED: 'http://redpencil.data.gift/id/concept/JobStatus/failed',
  CANCELED: 'http://redpencil.data.gift/id/concept/JobStatus/canceled',
};
