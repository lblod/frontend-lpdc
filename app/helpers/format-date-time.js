import { helper } from '@ember/component/helper';
import { format } from 'date-fns';

export default helper(function formatDateTime([datetime, dateFormat]) {
  if (!(datetime instanceof Date)) return '';
  if (!dateFormat) {
    dateFormat = 'dd-MM-yyyy - HH:mm';
  }
  return format(datetime, dateFormat);
});
