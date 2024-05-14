import updateRecall, { currentHighestRosh } from './updateRecall'
import { StageEnum } from './StageEnum'
import { ppudCreateRecall, updateRecommendation } from '../data/makeDecisionApiClient'
import { RecommendationResponse } from '../@types/make-recall-decision-api'

jest.mock('../data/makeDecisionApiClient')

describe('update recall', () => {
  it('happy path - stage has passed', async () => {
    const bookingMemento = {
      stage: StageEnum.RECALL_BOOKED,
    }

    const result = await updateRecall(bookingMemento, {}, 'token', { xyz: true })

    expect(ppudCreateRecall).not.toHaveBeenCalled()
    expect(bookingMemento).toEqual(result)
  })

  it('happy path', async () => {
    const bookingMemento = {
      stage: StageEnum.RELEASE_BOOKED,
      offenderId: '767',
      sentenceId: '444',
      releaseId: '555',
      failed: true,
      failedMessage: '{}',
    }

    const recommendation: RecommendationResponse = {
      id: '1',
      decisionDateTime: '2024-01-29T16:15:39',
      bookRecallToPpud: {
        mappaLevel: 'Level 2 - local inter-agency management',
        policeForce: 'NCIS Los Angeles',
        probationArea: 'london',
        receivedDateTime: '2024-01-29T16:15:39',
      },
      isExtendedSentence: true,
      hasContrabandRisk: {
        selected: true,
        details: 'Contraband detail...',
      },
      currentRoshForPartA: {
        riskToChildren: 'LOW',
        riskToPublic: 'HIGH',
        riskToKnownAdult: 'MEDIUM',
        riskToStaff: 'VERY_HIGH',
        riskToPrisoners: 'NOT_APPLICABLE',
      },
    } as unknown as RecommendationResponse

    ;(ppudCreateRecall as jest.Mock).mockResolvedValue({ recall: { id: '898' } })

    const result = await updateRecall(bookingMemento, recommendation, 'token', { xyz: true })

    expect(ppudCreateRecall).toHaveBeenCalledWith('token', '767', '555', {
      decisionDateTime: '2024-01-29T16:15:39',
      isExtendedSentence: true,
      isInCustody: false,
      mappaLevel: 'Level 2 - local inter-agency management',
      policeForce: 'NCIS Los Angeles',
      probationArea: 'london',
      receivedDateTime: '2024-01-29T16:15:39',
      riskOfContrabandDetails: 'Contraband detail...',
      riskOfSeriousHarmLevel: 'VeryHigh',
    })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookingMemento: {
          offenderId: '767',
          sentenceId: '444',
          recallId: '898',
          releaseId: '555',
          stage: 'RECALL_BOOKED',
        },
      },
      token: 'token',
      featureFlags: {
        xyz: true,
      },
    })
    expect(result).toEqual({
      offenderId: '767',
      sentenceId: '444',
      recallId: '898',
      releaseId: '555',
      stage: 'RECALL_BOOKED',
    })
  })
})

describe('rosh', () => {
  it('mappings', async () => {
    expect(currentHighestRosh(undefined)).toEqual(undefined)

    expect(currentHighestRosh(null)).toEqual(undefined)

    expect(
      currentHighestRosh({
        riskToPrisoners: 'HIGH',
        riskToPublic: 'LOW',
        riskToStaff: 'MEDIUM',
        riskToKnownAdult: 'NOT_APPLICABLE',
        riskToChildren: 'MEDIUM',
      })
    ).toEqual('High')

    expect(
      currentHighestRosh({
        riskToPrisoners: 'LOW',
        riskToPublic: 'LOW',
        riskToStaff: 'VERY_HIGH',
        riskToKnownAdult: 'NOT_APPLICABLE',
        riskToChildren: 'MEDIUM',
      })
    ).toEqual('VeryHigh')

    expect(
      currentHighestRosh({
        riskToPrisoners: 'LOW',
        riskToPublic: 'MEDIUM',
        riskToStaff: 'LOW',
        riskToKnownAdult: 'NOT_APPLICABLE',
        riskToChildren: 'LOW',
      })
    ).toEqual('Medium')

    expect(
      currentHighestRosh({
        riskToPrisoners: 'LOW',
        riskToPublic: 'LOW',
        riskToStaff: 'LOW',
        riskToKnownAdult: 'NOT_APPLICABLE',
        riskToChildren: 'LOW',
      })
    ).toEqual('Low')

    expect(
      currentHighestRosh({
        riskToPrisoners: 'NOT_APPLICABLE',
        riskToPublic: 'NOT_APPLICABLE',
        riskToStaff: 'NOT_APPLICABLE',
        riskToKnownAdult: 'NOT_APPLICABLE',
        riskToChildren: 'NOT_APPLICABLE',
      })
    ).toEqual('NotApplicable')
  })
})
