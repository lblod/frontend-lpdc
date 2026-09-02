import { service } from '@ember/service';
import Component from '@glimmer/component';
import { LogoutIcon } from '@appuniversum/ember-appuniversum/components/icons/logout';
import { LoginIcon } from '@appuniversum/ember-appuniversum/components/icons/login';
import { SwitchIcon } from '@appuniversum/ember-appuniversum/components/icons/switch';
import { UserIcon } from '@appuniversum/ember-appuniversum/components/icons/user';
import { PauseIcon } from '@appuniversum/ember-appuniversum/components/icons/pause';
import { PlayIcon } from '@appuniversum/ember-appuniversum/components/icons/play';

export default class ImpersonationMenu extends Component {
  @service currentSession;
  @service impersonation;

  LogoutIcon = LogoutIcon;
  LoginIcon = LoginIcon;
  SwitchIcon = SwitchIcon;
  UserIcon = UserIcon;

  get isImpersonating() {
    return this.impersonation.isImpersonating;
  }

  get icon() {
    return this.isImpersonating ? PauseIcon : PlayIcon;
  }

  get user() {
    if (!this.isImpersonating) {
      return null;
    }

    return this.currentSession.user;
  }

  get adminLabel() {
    return this.isImpersonating ? `Admin: ${this.user.fullName}` : 'Admin';
  }

  stopImpersonation = async () => {
    await this.impersonation.stopImpersonation();
    window.location.reload();
  };
}
