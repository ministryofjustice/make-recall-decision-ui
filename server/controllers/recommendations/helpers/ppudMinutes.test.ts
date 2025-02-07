import { RecommendationResponse, RoshData } from '../../../@types/make-recall-decision-api'
import { generateRecallMinuteText } from './ppudMinutes'

const recommendationResponse: RecommendationResponse = {
  id: '1',
  isExtendedSentence: true,
  prisonOffender: {
    status: 'ACTIVE IN',
  },
  currentRoshForPartA: {
    riskToChildren: 'VERY_HIGH',
    riskToPublic: 'VERY_HIGH',
    riskToKnownAdult: 'VERY_HIGH',
    riskToStaff: 'VERY_HIGH',
    riskToPrisoners: 'VERY_HIGH',
  },
  bookRecallToPpud: {
    custodyType: 'Determinate',
    mappaLevel: 'Level 2 - local inter-agency management',
    minute: 'an example minute',
  },
} as unknown as RecommendationResponse

describe('generate recall minute text', () => {
  it('all inputs populated', async () => {
    expect(generateRecallMinuteText(recommendationResponse)).toEqual(
      `BACKGROUND INFO \n` +
        `Extended sentence: YES\n` +
        `Risk of Serious Harm Level: VERY HIGH\n` +
        `In custody: YES at HMP\n` +
        `Notes regarding documents added from Consider a Recall:\n` +
        `an example minute`
    )
  })

  it('all inputs alternatively populated', async () => {
    recommendationResponse.isExtendedSentence = false
    recommendationResponse.prisonOffender.status = 'OUT'
    recommendationResponse.currentRoshForPartA = {
      riskToChildren: 'NOT_APPLICABLE',
      riskToPublic: 'MEDIUM',
      riskToKnownAdult: 'HIGH',
      riskToStaff: 'MEDIUM',
      riskToPrisoners: 'LOW',
    } as unknown as RoshData
    recommendationResponse.bookRecallToPpud.minute = 'another minute'

    expect(generateRecallMinuteText(recommendationResponse)).toEqual(
      `BACKGROUND INFO \n` +
        `Extended sentence: NO\n` +
        `Risk of Serious Harm Level: HIGH\n` +
        `In custody: NO\n` +
        `Notes regarding documents added from Consider a Recall:\n` +
        `another minute`
    )
  })

  it('all inputs null', async () => {
    recommendationResponse.isExtendedSentence = null
    recommendationResponse.prisonOffender = null
    recommendationResponse.currentRoshForPartA = null
    recommendationResponse.bookRecallToPpud = null

    expect(generateRecallMinuteText(recommendationResponse)).toEqual(
      'BACKGROUND INFO \nExtended sentence: NO\nRisk of Serious Harm Level: undefined\nIn custody: NO'
    )
  })
})
