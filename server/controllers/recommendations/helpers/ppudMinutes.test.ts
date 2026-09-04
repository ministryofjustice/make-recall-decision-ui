import { RecommendationResponse, RoshData } from '../../../@types/make-recall-decision-api'
import generateRecallMinuteText from './ppudMinutes'
import { SentenceGroup } from '../sentenceInformation/formOptions'
import randomEnum from '../../../@types/enum.testFactory'
import {
  BookRecallToPpud,
  PrisonOffender,
} from '../../../@types/make-recall-decision-api/models/RecommendationResponse'

describe('generate recall minute text', () => {
  const recommendationResponse: RecommendationResponse = {
    id: '1',
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

  describe('PPUD minutes', () => {
    it('all inputs populated', () => {
      expect(
        generateRecallMinuteText({
          ...recommendationResponse,
          sentenceGroup: SentenceGroup.EXTENDED,
        }),
      ).toEqual(
        `Background information\n` +
          `Extended sentence: Yes\n` +
          `Risk of serious harm level: VERY HIGH\n` +
          `In custody: Yes (at HMP)\n` +
          `Sentencing court: \n\n` +
          `More information\n` +
          `an example minute`,
      )
    })

    it('all inputs alternatively populated', () => {
      expect(
        generateRecallMinuteText({
          ...recommendationResponse,
          sentenceGroup: randomEnum(SentenceGroup, [SentenceGroup.EXTENDED]),
          prisonOffender: {
            status: 'OUT',
          } as unknown as PrisonOffender,
          currentRoshForPartA: {
            riskToChildren: 'NOT_APPLICABLE',
            riskToPublic: 'MEDIUM',
            riskToKnownAdult: 'HIGH',
            riskToStaff: 'MEDIUM',
            riskToPrisoners: 'LOW',
          } as unknown as RoshData,
          bookRecallToPpud: {
            minute: 'another minute',
          } as unknown as BookRecallToPpud,
        }),
      ).toEqual(
        `Background information\n` +
          `Extended sentence: No\n` +
          `Risk of serious harm level: HIGH\n` +
          `In custody: No\n` +
          `Sentencing court: \n\n` +
          `More information\n` +
          `another minute`,
      )
    })

    it('all nullable inputs null', () => {
      const sentenceGroup = randomEnum(SentenceGroup)

      expect(
        generateRecallMinuteText({
          ...recommendationResponse,
          sentenceGroup,
          prisonOffender: null,
          currentRoshForPartA: null,
          bookRecallToPpud: null,
        }),
      ).toEqual(
        `Background information\n` +
          `Extended sentence: ${sentenceGroup === SentenceGroup.EXTENDED ? 'Yes' : 'No'}\n` +
          `Risk of serious harm level: undefined\n` +
          `In custody: No\n` +
          `Sentencing court: \n\n` +
          `More information\n`,
      )
    })
  })
})
