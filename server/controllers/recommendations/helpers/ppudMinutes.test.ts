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

  const ftr56TestCases = [
    {
      description: 'with FTR56 flag enabled',
      ftr56Enabled: true,
    },
    {
      description: 'with FTR56 flag disabled',
      ftr56Enabled: false,
    },
  ]
  ftr56TestCases.forEach(({ description, ftr56Enabled }) => {
    describe(description, () => {
      it('all inputs populated', async () => {
        expect(
          generateRecallMinuteText(
            {
              ...recommendationResponse,
              isExtendedSentence: ftr56Enabled ? undefined : true,
              sentenceGroup: ftr56Enabled ? SentenceGroup.EXTENDED : undefined,
            },
            ftr56Enabled,
          ),
        ).toEqual(
          `BACKGROUND INFO \n` +
            `Extended sentence: YES\n` +
            `Risk of Serious Harm Level: VERY HIGH\n` +
            `In custody: YES at HMP\n` +
            `Notes regarding documents added from Consider a Recall:\n` +
            `an example minute`,
        )
      })

      it('all inputs alternatively populated', async () => {
        expect(
          generateRecallMinuteText(
            {
              ...recommendationResponse,
              isExtendedSentence: ftr56Enabled ? undefined : false,
              sentenceGroup: ftr56Enabled ? randomEnum(SentenceGroup, [SentenceGroup.EXTENDED]) : undefined,
              prisonOffender: { status: 'OUT' } as unknown as PrisonOffender,
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
            },
            ftr56Enabled,
          ),
        ).toEqual(
          `BACKGROUND INFO \n` +
            `Extended sentence: NO\n` +
            `Risk of Serious Harm Level: HIGH\n` +
            `In custody: NO\n` +
            `Notes regarding documents added from Consider a Recall:\n` +
            `another minute`,
        )
      })

      it('all nullable inputs null', async () => {
        const sentenceGroup = ftr56Enabled ? randomEnum(SentenceGroup) : undefined
        expect(
          generateRecallMinuteText(
            {
              ...recommendationResponse,
              isExtendedSentence: null,
              sentenceGroup,
              prisonOffender: null,
              currentRoshForPartA: null,
              bookRecallToPpud: null,
            },
            ftr56Enabled,
          ),
        ).toEqual(
          `BACKGROUND INFO \nExtended sentence: ${ftr56Enabled && sentenceGroup === SentenceGroup.EXTENDED ? 'YES' : 'NO'}\nRisk of Serious Harm Level: undefined\nIn custody: NO`,
        )
      })
    })
  })
})
