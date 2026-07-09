import { helper } from '@ember/component/helper';

export function organizationName([organization]) {
  return `${organization.classificatie.label} ${organization.naam}`;
}

export default helper(organizationName);
