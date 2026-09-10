import { RecommendationResponse, RoshData } from '../../../@types/make-recall-decision-api'
import generateRecallMinuteText from './ppudMinutes'
import { SentenceGroup } from '../sentenceInformation/formOptions'
import randomEnum from '../../../@types/enum.testFactory'
import { PrisonOffender } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import { RoshEnum } from '../../../@types/make-recall-decision-api/models/RoshData'

describe('generate recall minute text', () => {
  const recommendationResponse: RecommendationResponse = RecommendationResponseGenerator.generate({
    prisonOffender: {
      status: 'ACTIVE IN',
    },
    bookRecallToPpud: {
      custodyType: 'Determinate',
      mappaLevel: 'Level 2 - local inter-agency management',
    },
  })

  describe('PPUD minutes', () => {
    it('all inputs populated', () => {
      const sentenceCourt = 'Glasgow High Court'
      const recommendation = {
        ...recommendationResponse,
        sentenceGroup: SentenceGroup.EXTENDED,
        prisonOffender: {
          status: 'ACTIVE IN',
        } as unknown as PrisonOffender,
        currentRoshForPartA: {
          riskToChildren: RoshEnum.VERY_HIGH,
          riskToPublic: RoshEnum.VERY_HIGH,
          riskToKnownAdult: RoshEnum.VERY_HIGH,
          riskToStaff: RoshEnum.VERY_HIGH,
          riskToPrisoners: RoshEnum.VERY_HIGH,
        },
        bookRecallToPpud: {
          ...recommendationResponse.bookRecallToPpud,
          minute: 'an example minute',
        },
        nomisIndexOffence: {
          allOptions: [
            {
              offenderChargeId: 1,
              courtDescription: sentenceCourt,
              offenceStatute: '',
              offenceDescription: '',
              offenceDate: '',
              sentenceDate: '',
              sentenceStartDate: '',
              sentenceEndDate: '',
              sentenceSequenceExpiryDate: '',
              bookingId: 0,
              terms: [{ years: 2, months: 1, weeks: 2, days: 1, code: 'P001' }],
              releaseDate: '',
              releasingPrison: '',
              licenceExpiryDate: '',
            },
          ],
          selected: 1,
        },
      }
      expect(generateRecallMinuteText(recommendation)).toEqual(
        `Background information\n` +
          `Extended sentence: Yes\n` +
          `Risk of serious harm level: VERY HIGH\n` +
          `In custody: Yes\n` +
          `Sentencing court: ${sentenceCourt}\n\n` +
          `More information\n`,
      )
    })

    it('all inputs alternatively populated', () => {
      const sentenceCourt = 'Port Carolineshire Court'
      const recommendation = {
        ...recommendationResponse,
        sentenceGroup: randomEnum(SentenceGroup, [SentenceGroup.EXTENDED]),
        prisonOffender: {
          status: 'OUT',
        } as unknown as PrisonOffender,
        currentRoshForPartA: {
          riskToChildren: RoshEnum.NOT_APPLICABLE,
          riskToPublic: RoshEnum.MEDIUM,
          riskToKnownAdult: RoshEnum.HIGH,
          riskToStaff: RoshEnum.MEDIUM,
          riskToPrisoners: RoshEnum.LOW,
        } as unknown as RoshData,
        nomisIndexOffence: {
          allOptions: [
            {
              offenderChargeId: 1,
              courtDescription: sentenceCourt,
              offenceStatute: '',
              offenceDescription: '',
              offenceDate: '',
              sentenceDate: '',
              sentenceStartDate: '',
              sentenceEndDate: '',
              sentenceSequenceExpiryDate: '',
              bookingId: 0,
              terms: [
                {
                  years: 2,
                  months: 1,
                  weeks: 2,
                  days: 1,
                  code: 'P001',
                },
              ],
              releaseDate: '',
              releasingPrison: '',
              licenceExpiryDate: '',
            },
          ],
          selected: 1,
        },
      }
      expect(generateRecallMinuteText(recommendation)).toEqual(
        `Background information\n` +
          `Extended sentence: No\n` +
          `Risk of serious harm level: HIGH\n` +
          `In custody: No\n` +
          `Sentencing court: ${sentenceCourt}\n\n` +
          `More information\n`,
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
          nomisIndexOffence: null,
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
