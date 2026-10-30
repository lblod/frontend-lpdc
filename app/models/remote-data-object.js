import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class RemoteUrlModel extends Model {
  @attr uri;
  @attr source;
  @attr('date') created;
  @attr('date') modified;
  @attr status;
  @attr creator;

  @belongsTo('file', { async: true, inverse: null }) file;

  get downloadLink() {
    return `/files/${this.id}/download`;
  }

  get downloadSuccess() {
    return (
      this.status ===
      'http://lblod.data.gift/file-download-statuses/success'
    );
  }

  get downloadOngoing() {
    const ongoingStatuses = [
      'http://lblod.data.gift/file-download-statuses/ongoing',
      'http://lblod.data.gift/file-download-statuses/ready-to-be-cached',
    ];
    return ongoingStatuses.includes(this.status);
  }

  get downloadFailed() {
    return (
      this.status ===
      'http://lblod.data.gift/file-download-statuses/failure'
    );
  }
}

export const STATUS = {
  READY: "http://lblod.data.gift/file-download-statuses/ready-to-be-cached",
  SUCCESS: "http://lblod.data.gift/file-download-statuses/success",
  FAILED: "http://lblod.data.gift/file-download-statuses/failure"
}
