// Ideally these types come from the addon since they are the same for all fields, but it hasn't been converted to TS yet.
// NOTE: These are incomplete and most likely not 100% correct. We add and adjust the types as needed for our app's code.

import type { NamedNode } from 'rdflib';
import type ForkingStore from 'forking-store';

export type SemanticFormFieldArgs<T> = {
  formStore: ForkingStore;
  sourceNode: NamedNode;
  graphs: {
    formGraph: NamedNode;
    metaGraph: NamedNode;
    sourceGraph: NamedNode;
  };
  field: Field<T>;
  show: boolean;
};

export type EditorTipsFieldArgs = SemanticFormFieldArgs<{
  conceptHelpText: string;
  helpText: string;
}>;

export type Field<T> = {
  label?: string;
  options: T;
  help?: string;
  scope?: string;
  path?: string;
  rdflibScope?: NamedNode;
  rdflibPath?: NamedNode;
};

export type Options = {
  formGraph: NamedNode;
  sourceGraph: NamedNode;
  metaGraph: NamedNode;
  sourceNode: NamedNode;
  store: ForkingStore;
  path?: NamedNode;
  scope?: NamedNode;
};
