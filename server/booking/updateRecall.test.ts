import updateRecall from './updateRecall'
import StageEnum from './StageEnum'
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

  describe('happy path', () => {
    // ftr56TestCases.forEach(({ description, ftr56Enabled }) => {
    it('ftr56Disbled', async () => {
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
          policeForce: 'Bethnal Green Police Force',
          probationArea: 'london',
          receivedDateTime: '2024-01-29T16:15:39',
        },
        sentenceGroup: undefined,
        hasContrabandRisk: {
          selected: true,
          details: 'Contraband detail...',
        },
      } as unknown as RecommendationResponse

      ;(ppudCreateRecall as jest.Mock).mockResolvedValue({ recall: { id: '898' } })

      const result = await updateRecall(bookingMemento, recommendation, 'token', {})

      expect(ppudCreateRecall).toHaveBeenCalledWith('token', '767', '555', {
        decisionDateTime: '2024-01-29T16:15:39',
        isInCustody: false,
        mappaLevel: 'Level 2 - local inter-agency management',
        policeForce: 'Bethnal Green Police Force',
        probationArea: 'london',
        receivedDateTime: '2024-01-29T16:15:39',
        riskOfContrabandDetails: 'Contraband detail...',
      })

      expect(updateRecommendation).toHaveBeenCalledWith({
        featureFlags: {},
        recommendationId: '1',
        valuesToSave: {
          bookingMemento: {
            failed: undefined,
            failedMessage: undefined,
            offenderId: '767',
            sentenceId: '444',
            recallId: '898',
            releaseId: '555',
            stage: 'RECALL_BOOKED',
          },
        },
        token: 'token',
      })
      expect(result).toEqual({
        offenderId: '767',
        sentenceId: '444',
        recallId: '898',
        releaseId: '555',
        stage: 'RECALL_BOOKED',
      })
    })
    // })
  })
})
