import Model, { attr } from '@warp-drive/legacy/model';

export default class GenerationActivityModel extends Model {
  @attr uri;
  @attr attemptNumber;
  @attr originalText;
  @attr generatedText;
  @attr finalText;
  @attr status;
  @attr isImproved;
}

export const STATUS = {
  GEBRUIKT:
    'http://lblod.data.gift/concepts/25504f03-b26a-45ef-a288-0a364a8f2c0c',
  NIET_GEBRUIKT:
    'http://lblod.data.gift/concepts/0ec7b4a8-c281-4ff7-8b50-c02063a1e0dc',
};
