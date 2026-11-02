import { FORM } from '@lblod/submission-form-helpers';
import { Literal, NamedNode, type Collection } from 'rdflib';
import type { Term } from 'rdflib/lib/tf-types';
import type ForkingStore from 'forking-store';
import { assert } from '@ember/debug';

/**
 * Variant of constraintMatchValues that treats a missing value as passing (returns true).
 * For an arbitrary list of elements, check whether the provided value matches one element of the list
 */

export default function matchValuesAllowMissing(
  values: Term[],
  options: {
    constraintUri: NamedNode;
    store: ForkingStore;
  },
) {
  const { constraintUri, store } = options;
  const targetValuesIn = store.match(
    constraintUri,
    FORM('valuesIn'),
    undefined,
  );
  const targetValuesNotIn = store.match(
    constraintUri,
    FORM('valuesNotIn'),
    undefined,
  );
  const allowMissing = store.any(
    constraintUri,
    new NamedNode(
      'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#allowMissing',
    ),
    undefined,
  );

  if (values.length == 0) {
    if (allowMissing) {
      // Missing values are allowed if the form config configures it that way.
      return Literal.toJS(allowMissing);
    }
    return false;
  }

  if (!targetValuesIn.length && !targetValuesNotIn.length) {
    return false;
  }

  const hasTargetsValuesIn = Boolean(targetValuesIn.length);
  const collection = (
    hasTargetsValuesIn
      ? targetValuesIn[0]?.object
      : targetValuesNotIn[0]?.object
  ) as Collection;

  // We can't use the `isCollection` util since that overrides the Collection's generic to `any`..
  assert(
    'The value for valuesIn/valuesNotIn is expected to be a collection',
    collection.termType === 'Collection',
  );

  // For _some_ reason, rdflib doesn't consider a boolean literal with value `"true"` equal to one with value `"1"`, so we need to normalize ourselves.
  // We assume elements are Literals for now which matches our current usage, but isn't really generic.
  const normalizedElements = collection.elements.map((element) =>
    Literal.toJS(element),
  );
  const hasMatchingValues =
    values.filter((value) => normalizedElements.includes(Literal.toJS(value)))
      .length > 0;

  return hasTargetsValuesIn ? hasMatchingValues : !hasMatchingValues;
}
