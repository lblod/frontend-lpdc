import ApplicationSerializer from './application';

export default class DataContainerSerializer extends ApplicationSerializer {
  attrs = { files: { serialize: true } };
}
