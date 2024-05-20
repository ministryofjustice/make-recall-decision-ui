import { StageEnum } from './StageEnum'
import { ppudCreateMinute, updateRecommendation } from '../data/makeDecisionApiClient'
import createMinute from './createMinute'

jest.mock('../data/makeDecisionApiClient')

describe('create minute', () => {
  it('happy path - stage has passed', async () => {
    const bookingMemento = {
      stage: StageEnum.MINUTE_BOOKED,
    }

    const result = await createMinute(bookingMemento, '123', 'subject', 'text', 'token', { xyz: true })

    expect(ppudCreateMinute).not.toHaveBeenCalled()
    expect(bookingMemento).toEqual(result)
  })

  it('happy path', async () => {
    const bookingMemento = {
      stage: StageEnum.RECALL_BOOKED,
      recallId: '767',
      failed: true,
      failedMessage: '{}',
    }

    const result = await createMinute(bookingMemento, '123', 'subject', 'text', 'token', { xyz: true })

    expect(ppudCreateMinute).toHaveBeenCalledWith('token', '767', {
      subject: 'subject',
      text: 'text',
    })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      valuesToSave: {
        bookingMemento: {
          recallId: '767',
          stage: 'MINUTE_BOOKED',
        },
      },
      token: 'token',
      featureFlags: {
        xyz: true,
      },
    })
    expect(result).toEqual({
      recallId: '767',
      stage: 'MINUTE_BOOKED',
    })
  })
})
