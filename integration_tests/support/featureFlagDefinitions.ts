export default [
  {
    name: 'Mocked Flag',
    key: 'ui-mockedFlag',
    description: 'Mocked Flag',
    enabled: false,
  },
  {
    name: 'Recommendations Page',
    key: 'ui-flagRecommendationsPage',
    description: 'Recommendations Page',
    enabled: false,
  },
  {
    name: 'Delete Recommendation',
    key: 'ui-flagDeleteRecommendation',
    description:
      'Development team use only - shows links on the Recommendations tab allowing any recommendation to be marked as deleted. Deleting a recommendation allows a new one to be created, if needed. The "deleted" recommendation will be retained in the database, and no data or audit info will be lost.',
    enabled: false,
  },
  {
    name: 'PPCS Indeterminate Journey',
    key: 'ui-ppcsIndeterminateJourney',
    description: 'Enables the indeterminate sentence journey for CaR PPCS users',
    enabled: false,
  },
  // Note that the flags listed in this file will be recognised as flags in the integration tests, but the enabled value
  // won't have any effect. It looks like this is due to the evaluation step (featureFlagService.isFeatureEnabled) not
  // being mocked or influence in any way for the tests, resulting in their results not having any 'enabled' value. This
  // in turns result in all flags having a default value of false for the tests (probably OK in most cases).
]
