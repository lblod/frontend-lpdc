import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class SourceDocumentModel extends Model {
  @attr uri;
  @attr title;
  @attr extractedHtml;

  @belongsTo('file', { async: true, inverse: null }) file;
}
