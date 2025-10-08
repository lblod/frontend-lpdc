import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ContextService extends Service {
  @tracked parentContexts = [];

  addParentContext(context) {
    this.parentContexts.push(context);
  }

  removeParentContext(context) {
    this.parentContexts = this.parentContexts.filter((pc) => pc !== context);
  }

  findParentContextWithContract(aContract) {
    return this.parentContexts.find(
      (pc) => typeof pc[aContract] === 'function',
    );
  }
}
