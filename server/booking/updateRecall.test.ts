import updateRecall from './updateRecall'
import StageEnum from './StageEnum'
import { ppudCreateRecall, updateRecommendation } from '../data/makeDecisionApiClient'
import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { SentenceGroup } from '../controllers/recommendations/sentenceInformation/formOptions'

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
        policeForce: 'Bethnal Green Police Force',
        probationArea: 'london',
        receivedDateTime: '2024-01-29T16:15:39',
      },
      sentenceGroup: SentenceGroup.EXTENDED,
      hasContrabandRisk: {
        selected: true,
        details: 'Contraband detail...',
      },
    } as unknown as RecommendationResponse

    const featureFlags = {}

    ;(ppudCreateRecall as jest.Mock).mockResolvedValue({ recall: { id: '898' } })

    const result = await updateRecall(bookingMemento, recommendation, 'token', featureFlags)

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
      featureFlags,
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
