import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';

export default Controller.extend({
  sort: '-modified',
  page: 0,
  size: 20
});