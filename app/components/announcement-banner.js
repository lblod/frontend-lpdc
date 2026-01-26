import Component from '@glimmer/component';
import config from 'frontend-lpdc/config/environment';

export default class AnnouncementBanner extends Component {
  get showBanner() {
    const message = config.announcementMessage;
    return Boolean(message) && !message.startsWith('{{');
  }

  get message() {
    return config.announcementMessage;
  }
}
