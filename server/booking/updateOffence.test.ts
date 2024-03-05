import { StageEnum } from './StageEnum'
import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { ppudUpdateOffence, updateRecommendation } from '../data/makeDecisionApiClient'
import updateOffence from './updateOffence'

jest.mock('../data/makeDecisionApiClient')

describe('update offence', () => {
  it('happy path - stage has passed', async () => {
    const bookingMomento = {
      stage: StageEnum.OFFENCE_BOOKED,
    }

    const result = await updateOffence(bookingMomento, {}, 'token', { xyz: true })

    expect(ppudUpdateOffence).not.toHaveBeenCalled()
    expect(bookingMomento).toEqual(result)
  })

  it('happy path', async () => {
    const bookingMomento = {
      stage: StageEnum.SENTENCE_BOOKED,
      offenderId: '767',
      sentenceId: '444',
      failed: true,
      failedMessage: '{}',
    }

    const recommendation: RecommendationResponse = {
      id: '1',
      bookRecallToPpud: {
        indexOffence: 'index offence',
      },
      nomisIndexOffence: {
        allOptions: [
          {
            offenderChargeId: 3934369,
            offenceDate: '2016-01-01',
            licenceExpiryDate: '2018-02-02',
            releaseDate: '2017-03-03',
            offenceEndDate: '2019-04-04',
            courtDescription: 'court desc',
            terms: [
              {
                days: 1,
                months: 2,
                years: 3,
                code: 'IMP',
              },
            ],
          },
        ],
        selected: 3934369,
      },
    } as unknown as RecommendationResponse

    const result = await updateOffence(bookingMomento, recommendation, 'token', { xyz: true })

    expect(ppudUpdateOffence).toHaveBeenCalledWith('token', '767', '444', {
      indexOffence: 'index offence',
      dateOfIndexOffence: '2016-01-01',
    })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookingMomento: {
          offenderId: '767',
          sentenceId: '444',
          stage: 'OFFENCE_BOOKED',
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
      stage: 'OFFENCE_BOOKED',
    })
  })
})
