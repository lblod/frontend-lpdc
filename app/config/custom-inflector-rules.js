import { plural, singular, irregular } from '@ember-data/request-utils/string';

plural(/$/, 'en');
plural(/e$/, 'es');
plural(/e([lnr])$/, 'e$1s');
plural(/([aiuo])$/, '$1s');
plural(/([^aiuoe])([aiuo])([a-z])$/, '$1$2$3$3en'); // TODO: this is a bit hack
plural(/uis$/, 'uizen');
plural(/ief$/, 'ieven');
plural(/or$/, 'oren');
plural(/ie$/, 'ies');
plural(/eid$/, 'eden');
plural(/aa([a-z])$/, 'a$1en');
plural(/uu([a-z])$/, 'u$1en');
plural(/oo([a-z])$/, 'o$1en');
singular(/en$/, '');
singular(/es$/, 'e');
singular(/e([lnr])s$/, 'e$1');
singular(/([aiuo])s$/, '$1');
singular(/([^aiuoe])([aiuo])([a-z])\3en$/, '$1$2$3'); // TODO: this is a bit hack
singular(/uizen$/, 'uis');
singular(/ieven$/, 'ief');
singular(/ies$/, 'ie');
singular(/eden$/, 'eid');
singular(/a([a-z])en$/, 'aa$1');
singular(/u([a-z])en$/, 'uu$1');
singular(/o([a-z])en$/, 'oo$1');
singular(/([auio])s$/, '$1s');

irregular('account', 'accounts');
irregular('file', 'files');
irregular('concept', 'concepts');
irregular('concept-scheme', 'concept-schemes');
irregular('concept-display-configuration', 'concept-display-configurations');
