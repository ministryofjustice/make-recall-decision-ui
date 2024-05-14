import { StageEnum } from './StageEnum'
import { ppudUpdateRelease, ppudUploadMandatoryDocument, updateRecommendation } from '../data/makeDecisionApiClient'
import uploadMandatoryDocument from './uploadMandatoryDocument'

jest.mock('../data/makeDecisionApiClient')

describe('update release', () => {
  it('happy path - stage has passed', async () => {
    const bookingMemento = {
      stage: StageEnum.PART_A_UPLOADED,
    }

    const result = await uploadMandatoryDocument(
      bookingMemento,
      '1',
      StageEnum.RECALL_BOOKED,
      StageEnum.PART_A_UPLOADED,
      '123',
      'PpudPartA',
      'token',
      { xyz: true }
    )

    expect(ppudUploadMandatoryDocument).not.toHaveBeenCalled()
    expect(bookingMemento).toEqual(result)
  })

  it('happy path', async () => {
    ;(ppudUpdateRelease as jest.Mock).mockResolvedValue({ release: { id: '555' } })

    const bookingMemento = {
      stage: StageEnum.RECALL_BOOKED,
      offenderId: '767',
      sentenceId: '444',
      recallId: '888',
      failed: true,
      failedMessage: '{}',
    }

    const result = await uploadMandatoryDocument(
      bookingMemento,
      '1',
      StageEnum.RECALL_BOOKED,
      StageEnum.PART_A_UPLOADED,
      '123',
      'PpudPartA',
      'token',
      { xyz: true }
    )

    expect(ppudUploadMandatoryDocument).toHaveBeenCalledWith('token', '888', { category: 'PpudPartA', id: '123' })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookingMemento: {
          offenderId: '767',
          sentenceId: '444',
          recallId: '888',
          stage: 'PART_A_UPLOADED',
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
      stage: 'PART_A_UPLOADED',
    })
  })
})
