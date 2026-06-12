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
    name: 'FTR56 Flag',
    key: 'ui-flagFTR56Enabled',
    description: 'FTR56 Flag',
    enabled: false,
  },
]
