import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { sortBy } from 'lodash';

export default class ConceptualPublicServiceModel extends Model {
  @attr uri;
  @attr productId;
  @attr('language-string-set') name;
  @attr('datetime') startDate;
  @attr('datetime') endDate;
  @attr('datetime') dateCreated;
  @attr('datetime') dateModified;
  @attr versionedSource;
  @attr hasLatestFunctionalChange;

  @belongsTo('concept', {
    async: false,
    inverse: null,
  })
  type;

  @belongsTo('concept', {
    async: false,
    inverse: null,
  })
  status;

  @belongsTo('concept-display-configuration', {
    async: false,
    inverse: null,
  })
  displayConfiguration;

  @hasMany('concept', {
    async: false,
    inverse: null,
  })
  targetAudiences;

  @hasMany('concept', {
    async: false,
    inverse: null,
  })
  thematicAreas;

  @hasMany('concept', {
    async: false,
    inverse: null,
  })
  publicationMedia;

  get nameNl() {
    if (!this.name?.length) {
      return null;
    }
    const nameNl = this.name.find((name) => name.language === 'nl')?.content;
    const nl = this.name.find((name) =>
      name.language.startsWith('nl'),
    )?.content;
    const fallBack = this.name[0].content;
    return nameNl ?? nl ?? fallBack;
  }

  get targetAudiencesOrderedOnLabel() {
    return sortBy([...this.targetAudiences], (c) => {
      return c.label;
    });
  }

  get thematicAreasOrderedOnLabel() {
    return sortBy([...this.thematicAreas], (c) => {
      return c.label;
    });
  }

  get publicationMediaOrderedOnLabel() {
    return sortBy([...this.publicationMedia], (c) => {
      return c.label;
    });
  }
}
