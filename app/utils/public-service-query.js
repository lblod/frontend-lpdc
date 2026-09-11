export function buildPublicServiceFilters(params, currentSession) {
  const query = {
    'filter[created-by][:uri:]': currentSession.group.uri,
  };

  if (params.search) {
    query['filter'] = params.search.trim();
  }

  if (params.isReviewRequiredFilterEnabled) {
    query['filter[:has:review-status]'] = true;
  }

  if (params.needsConversionFromFormalToInformalFilterEnabled) {
    query['filter[needs-conversion-from-formal-to-informal]'] = true;
  }

  if (params.isYourEurope) {
    query['filter[publication-media][:uri:]'] =
      'https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/YourEurope';
  }

  if (params.isFeedbackAvailable) {
    query['filter[feedback-available]'] = true;
  }

  if (params.isYearOld) {
    query['filter[is-year-old]'] = true;
  }

  if (params.isNotificationEnabled) {
    query['filter[notification-preferences][gebruiker][:id:]'] =
      currentSession.user.id;
  }

  if (params.forMunicipalityMerger) {
    query['filter[for-municipality-merger]'] = true;
  }

  if (params.statusIds?.length > 0) {
    query['filter[status][:id:]'] = params.statusIds.join(',');
  }

  if (params.producttypesIds?.length > 0) {
    query['filter[type][:id:]'] = params.producttypesIds.join(',');
  }

  if (params.doelgroepenIds?.length > 0) {
    query['filter[target-audiences][:id:]'] = params.doelgroepenIds.join(',');
  }

  if (params.themaIds?.length > 0) {
    query['filter[thematic-areas][:id:]'] = params.themaIds.join(',');
  }

  if (params.creatorIds?.length > 0) {
    query['filter[creator][:id:]'] = params.creatorIds.join(',');
  }

  if (params.lastModifierIds?.length > 0) {
    query['filter[last-modifier][:id:]'] = params.lastModifierIds.join(',');
  }

  return query;
}
