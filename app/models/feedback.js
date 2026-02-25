import Model, { attr, belongsTo } from '@ember-data/model';

export default class FeedbackModel extends Model {
  @attr uri;
  @attr('datetime') createdAt;
  @attr productnumber;
  @attr lpdcInstanceDerivedUri;

  @attr ipdcStatus;
  @attr status;
  @attr processingStatus;

  @belongsTo('feedback-question', {
    async: false,
    inverse: null,
  })
  question;
  @belongsTo('feedback-answer', {
    async: false,
    inverse: null,
  })
  answer;
  @belongsTo('public-service', {
    async: false,
    inverse: 'feedback',
  })
  instance;
}

export const IPDC_STATUS = {
  AANGEMAAKT: 'https://ipdc.vlaanderen.be/ns/FeedbackStatus#AANGEMAAKT',
  BEANTWOORD: 'https://ipdc.vlaanderen.be/ns/FeedbackStatus#BEANTWOORD',
  GELEZEN: 'https://ipdc.vlaanderen.be/ns/FeedbackStatus#ANTWOORD_GELEZEN',
  INGETROKKEN: 'https://ipdc.vlaanderen.be/ns/FeedbackStatus#INGETROKKEN',
};

export const FEEDBACK_STATUS = {
  OPEN: 'http://lblod.data.gift/concepts/1b3c5e7f-2a4d-4c6e-9f1b-3d5a7c9e2f4b',
  BEZIG: 'http://lblod.data.gift/concepts/7c9e1a3f-5d8b-4e2c-9a1e-3f5b7d9c2e4a',
  VERWERKT:
    'http://lblod.data.gift/concepts/2e4a6c8d-9f1b-4d3e-5a7c-9e1f3b5d7a9c',
};

export const PROCESSING_STATUS = {
  GEACCEPTEERD:
    'http://lblod.data.gift/concepts/caa0b2d0-4bfa-46c8-8ee3-f77d0fdfa655',
  GEWEIGERD:
    'http://lblod.data.gift/concepts/094d76ed-59c9-45a6-9f62-f93f79675c00',
};

export const FEEDBACK_STATUS_LABELS = {
  [FEEDBACK_STATUS.OPEN]: 'Open',
  [FEEDBACK_STATUS.BEZIG]: 'Verwerking bezig',
  [FEEDBACK_STATUS.VERWERKT]: 'Verwerkt',
};

export const FEEDBACK_PROCESSING_STATUS_LABELS = {
  [PROCESSING_STATUS.GEACCEPTEERD]: 'Geaccepteerd',
  [PROCESSING_STATUS.GEWEIGERD]: 'Geweigerd',
};
