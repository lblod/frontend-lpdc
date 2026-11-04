import Model, { hasMany, attr } from '@warp-drive/legacy/model';

export default class DataContainerModel extends Model {
  @attr uri;
  @attr hasGraph;
  @hasMany('file', { async: true, inverse: 'dataContainer' }) files;
}
