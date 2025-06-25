import completeRecommendationResponse from '../../../api/responses/get-recommendation.json'
import { setResponsePropertiesToNull } from '../../support/commands'

export const defaultUpdateRecommendationResponse = (crn: string, id: string) => ({
  ...setResponsePropertiesToNull(completeRecommendationResponse),
  id,
  createdDate: '2000-10-31T01:30:00.000Z',
  createdByUserFullName: 'Joe Bloggs',
  crn,
  personOnProbation: {
    name: 'Jane Bloggs',
    addresses: [
      {
        line1: '102 Petty France',
        line2: 'Petty France',
        town: 'London',
        postcode: 'SW1H 9AJ',
      },
    ],
  },
  recallType: { selected: { value: 'STANDARD' } },
  managerRecallDecision: {
    isSentToDelius: true,
  },
})
