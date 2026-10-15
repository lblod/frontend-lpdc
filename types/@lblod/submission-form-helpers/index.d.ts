// NOTE: These are incomplete and most likely not 100% correct. We add and adjust the types as needed for our app's code.
import type { Literal, NamedNode, Namespace, Statement } from 'rdflib';
import type ForkingStore from 'forking-store';
import type { Options } from 'frontend-lpdc/components/rdf-form-fields/types';
import { ObjectType } from 'rdflib/lib/types';

export function triplesForPath(options: {
  store: ForkingStore;
  formGraph: NamedNode;
  sourceNode: NamedNode;
  sourceGraph: NamedNode;
  scope?: unknown;
}): {
  triples: Statement[];
  values: ObjectType[]; // Not sure about this, should it be a generic and let the user provide it?
};

export function updateSimpleFormValue(
  options: Options,
  newValue?: Literal,
  oldValue?: Literal,
): void;

export function removeDatasetForSimpleFormValue(
  value: unknown,
  options: Options,
): void;

export default function constraintForUri(
  constraintUri: string,
): (values: unknown[], options: Options) => boolean;

export declare const FORM: ReturnType<typeof Namespace>;
