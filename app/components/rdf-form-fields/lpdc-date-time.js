import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import SimpleInputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/simple-value-input-field';
import {
  removeTriples,
  triplesForPath,
  XSD,
} from '@lblod/submission-form-helpers';
import { literal, NamedNode } from 'rdflib';

export default class RdfInputFieldsDateTimeComponent extends SimpleInputFieldComponent {
  inputId = 'date-time-' + guidFor(this);

  @tracked value = null;
  @tracked hour = null;
  @tracked minutes = null;

  get helpText() {
    return this.isLinkedToConcept
      ? this.args.field.options.conceptHelpText
      : this.args.field.options.helpText;
  }

  /**
   * This makes it possible to attach data to a "parent" sourceNodeA instead of the one we get passed as an argument.
   * We need this so we can render a field in a subform, while attaching the data to the parent form.
   * The field can opt into this behavior via the "sourceNodeViaInversePath" form option.
   * This is just a workaround. Ideally the data model would be changed so the data is stored on the relationship.
   * This also assumes there will only ever be a single subform instance and the relationship only goes up one level.
   */
  get sourceNodeViaInversePath() {
    const predicate = this.args.field.options?.sourceNodeViaInversePath;
    return predicate ? new NamedNode(predicate) : null;
  }

  /**
   * The node the data should be read from and written to. Resolved on first use
   * and memoized: once a listing entry is removed, the link to the owner is
   * gone, so a re-resolve at teardown would find nothing.
   */
  get redirectedSourceNode() {
    if (!this.sourceNodeViaInversePath) {
      return null;
    }

    if (this._ownerNode === undefined) {
      this._ownerNode = findOwnerNodeByInversePath(
        this.args.formStore,
        this.sourceNodeViaInversePath,
        this.args.sourceNode,
        this.args.graphs.sourceGraph,
      );
      if (!this._ownerNode) {
        throw new Error(
          `Option sourceNodeViaInversePath is configured, but no node links to the rendered source node "${this.args.sourceNode?.value}" via ${this.sourceNodeViaInversePath.value}`,
        );
      }
    }
    return this._ownerNode;
  }

  get storeOptions() {
    const baseStoreOptions = super.storeOptions;
    const redirectedSourceNode = this.redirectedSourceNode;
    if (redirectedSourceNode) {
      return { ...baseStoreOptions, sourceNode: redirectedSourceNode };
    }
    return baseStoreOptions;
  }

  get isLinkedToConcept() {
    const { store, sourceNode, sourceGraph } = this.storeOptions;

    // Check if there's a concept linked via dct:source
    const conceptLink = store.any(
      sourceNode,
      new NamedNode('http://purl.org/dc/terms/source'),
      undefined,
      sourceGraph,
    );

    return !!conceptLink;
  }

  loadProvidedValue() {
    const matches = triplesForPath(this.storeOptions);
    if (matches.values.length > 0) {
      this.nodeValue = matches.values[0];
      const datobj = new Date(this.nodeValue.value);
      this.value = datobj;
      this.hour = datobj.getHours();
      this.minutes = datobj.getMinutes();
    }
  }

  @action
  updateValue(isoDate, date) {
    const newValue = date ? literal(date.toISOString(), XSD('dateTime')) : null;
    this.updateValueInStore([newValue]);
  }

  @action
  updateValueInStore(values) {
    super.updateValue(values[0]);
    this.loadProvidedValue();
  }

  willDestroy() {
    // If sourceNodeViaInversePath is set, the data isn't stored on the listing
    // item but on the node linking to it. "Remove entry" in a listing only
    // deletes the link, so when the link is gone at teardown the entry was
    // removed and the data on the owner node needs to be cleaned up as well.
    // Redirected fields never fall back to the base class' cleanup-on-unmount:
    // in a form host without `cacheConditionals` that would delete their values
    // on any unmount.
    if (this.sourceNodeViaInversePath) {
      if (
        !findOwnerNodeByInversePath(
          this.args.formStore,
          this.sourceNodeViaInversePath,
          this.args.sourceNode,
          this.args.graphs.sourceGraph,
        )
      ) {
        removeTriples(this.storeOptions);
      }
      return;
    }

    super.willDestroy();
  }
}

/**
 * Returns the node that links to the source node via the given predicate, or
 * undefined when no such link exists.
 */
function findOwnerNodeByInversePath(store, predicate, sourceNode, sourceGraph) {
  return store.any(undefined, predicate, sourceNode, sourceGraph);
}
