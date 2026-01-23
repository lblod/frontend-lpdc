import Component from '@glimmer/component';
import config from 'frontend-lpdc/config/environment';

export default class AnnouncementBanner extends Component {
  get showBanner() {
    return !config.announcementMessage.startsWith('{{');
  }

  get message() {
    return config.announcementMessage;
  }
}
