import { StageEnum } from './StageEnum'
import { ppudUploadMandatoryDocument, updateRecommendation } from '../data/makeDecisionApiClient'
import uploadMandatoryDocument from './uploadMandatoryDocument'

jest.mock('../data/makeDecisionApiClient')

describe('update release', () => {
  it('happy path - stage has passed', async () => {
    const bookingMemento = {
      stage: StageEnum.RECALL_BOOKED,
      uploaded: ['123'],
    }

    const result = await uploadMandatoryDocument(bookingMemento, '1', '123', 'PpudPartA', 'token', { xyz: true })

    expect(ppudUploadMandatoryDocument).not.toHaveBeenCalled()
    expect(bookingMemento).toEqual(result)
  })

  it('happy path', async () => {
    const bookingMemento = {
      stage: StageEnum.RECALL_BOOKED,
      offenderId: '767',
      sentenceId: '444',
      recallId: '888',
      failed: true,
      failedMessage: '{}',
    }

    const result = await uploadMandatoryDocument(bookingMemento, '1', '123', 'PpudPartA', 'token', { xyz: true })

    expect(ppudUploadMandatoryDocument).toHaveBeenCalledWith('token', '888', { category: 'PpudPartA', id: '123' })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookingMemento: {
          offenderId: '767',
          sentenceId: '444',
          recallId: '888',
          stage: 'RECALL_BOOKED',
          uploaded: ['123'],
        },
      },
      token: 'token',
      featureFlags: {
        xyz: true,
      },
    })
    expect(result).toEqual({
      offenderId: '767',
      recallId: '888',
      sentenceId: '444',
      stage: 'RECALL_BOOKED',
      uploaded: ['123'],
    })
  })
})
