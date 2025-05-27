import completeRecommendationResponse from '../../../api/responses/get-recommendation.json'
import { setResponsePropertiesToNull } from '../../support/commands'

export const defaultUpdateRecommendationResponse = (crn: string, id: string) => ({
  ...setResponsePropertiesToNull(completeRecommendationResponse),
  id,
  createdDate: '2000-10-31T01:30:00.000Z',
  createdByUserFullName: 'Mr Anderson',
  crn,
  personOnProbation: {
    name: 'Paula Smith',
    addresses: [
      {
        line1: '41 Newport Pagnell Rd',
        line2: 'Newtown',
        town: 'Northampton',
        postcode: 'NN4 6HP',
      },
    ],
  },
  recallType: { selected: { value: 'STANDARD' } },
  managerRecallDecision: {
    isSentToDelius: true,
  },
})
