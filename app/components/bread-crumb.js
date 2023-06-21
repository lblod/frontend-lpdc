import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class BreadCrumbComponent extends Component {
  @service router;

  bread = [
    {
      route: 'public-services.index',
      crumbs: [{ label: 'Lokale Producten- en Dienstencatalogus' }],
    },
    {
      route: 'public-services.add',
      crumbs: [
        {
          label: 'Lokale Producten- en Dienstencatalogus',
          link: 'public-services',
        },
        { label: 'Product of dienst toevoegen' },
      ],
    },
    {
      route: 'public-services.new',
      crumbs: [
        {
          label: 'Lokale Producten- en Dienstencatalogus',
          link: 'public-services',
        },
        { label: 'Product of dienst toevoegen' },
      ],
    },
    {
      route: 'public-services.details',
      crumbs: [
        {
          label: 'Lokale Producten- en Dienstencatalogus',
          link: 'public-services',
        },
        // TODO: this should be the name of the service, but the breadcrumbs system doesn't support that
        { label: 'Details' },
      ],
    },
    {
      route: 'public-services.details.content',
      crumbs: [
        {
          label: 'Lokale Producten- en Dienstencatalogus',
          link: 'public-services',
        },
        // TODO: this should be the name of the service, but the breadcrumbs system doesn't support that
        { label: 'Details' },
        { label: 'Inhoud' },
      ],
    },
    {
      route: 'public-services.details.properties',
      crumbs: [
        {
          label: 'Lokale Producten- en Dienstencatalogus',
          link: 'public-services',
        },
        // TODO: this should be the name of the service, but the breadcrumbs system doesn't support that
        { label: 'Details' },
        { label: 'Eigenschappen' },
      ],
    },
    {
      route: 'public-services.concept-details',
      crumbs: [
        {
          label: 'Lokale Producten- en Dienstencatalogus',
          link: 'public-services',
        },
        // TODO: this should be the name of the service, but the breadcrumbs system doesn't support that
        { label: 'Concept details' },
      ],
    },
    {
      route: 'public-services.link-concept.index',
      crumbs: [
        {
          label: 'Lokale Producten- en Dienstencatalogus',
          link: 'public-services',
        },
        { label: 'Instantie koppelen' },
      ],
    },
    {
      route: 'public-services.link-concept.link',
      crumbs: [
        {
          label: 'Lokale Producten- en Dienstencatalogus',
          link: 'public-services',
        },
        { label: 'Instantie koppelen' },
      ],
    },
    {
      route: 'public-services.concept-details.content',
      crumbs: [
        {
          label: 'Lokale Producten- en Dienstencatalogus',
          link: 'public-services',
        },
        // TODO: this should be the name of the service, but the breadcrumbs system doesn't support that
        { label: 'Concept details' },
        { label: 'Inhoud' },
      ],
    },
    {
      route: 'public-services.concept-details.properties',
      crumbs: [
        {
          label: 'Lokale Producten- en Dienstencatalogus',
          link: 'public-services',
        },
        // TODO: this should be the name of the service, but the breadcrumbs system doesn't support that
        { label: 'Concept details' },
        { label: 'Eigenschappen' },
      ],
    },
  ];

  get crumbsForRoute() {
    const results = this.bread.filter(
      (value) => value.route === this.router.currentRouteName
    );
    if (results.length <= 0) return [];
    return results[0].crumbs;
  }
}
