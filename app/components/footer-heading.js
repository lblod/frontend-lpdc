import Component from '@glimmer/component';

export default class FooterHeadingComponent extends Component {
  get hostname() {
    return document.location.hostname;
  }
}
