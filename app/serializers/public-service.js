import ApplicationSerializer from './application';

export const ALLOWED_FIELDS = [
  'concept',
  'date-modified',
  'dateModified',
  'status',
  'review-status',
  'reviewStatus',
];

export default class PublicServiceSerializer extends ApplicationSerializer {
  serializeAttribute(snapshot, json, attributeName) {
    if (ALLOWED_FIELDS.includes(attributeName)) {
      super.serializeAttribute(...arguments);
    }
  }

  serializeBelongsTo(snapshot, json, relationship) {
    if (ALLOWED_FIELDS.includes(relationship.key)) {
      super.serializeBelongsTo(...arguments);
    }
  }

  serializeHasMany(snapshot, json, relationship) {
    if (ALLOWED_FIELDS.includes(relationship.key)) {
      super.serializeBelongsTo(...arguments);
    }
  }
}
