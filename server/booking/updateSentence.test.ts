import { StageEnum } from './StageEnum'
import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { ppudUpdateSentence, updateRecommendation } from '../data/makeDecisionApiClient'
import updateSentence from './updateSentence'

jest.mock('../data/makeDecisionApiClient')

describe('update sentence', () => {
  it('happy path - stage has passed', async () => {
    const bookingMemento = {
      stage: StageEnum.SENTENCE_BOOKED,
    }

    const result = await updateSentence(bookingMemento, {}, 'token', { xyz: true })

    expect(ppudUpdateSentence).not.toHaveBeenCalled()
    expect(bookingMemento).toEqual(result)
  })

  it('happy path', async () => {
    const bookingMemento = {
      stage: StageEnum.OFFENDER_BOOKED,
      offenderId: '767',
      sentenceId: '444',
      failed: true,
      failedMessage: '{}',
    }

    const recommendation: RecommendationResponse = {
      id: '1',
      bookRecallToPpud: {
        custodyType: 'Determinate',
        mappaLevel: 'Level 2 - local inter-agency management',
      },
      nomisIndexOffence: {
        allOptions: [
          {
            offenderChargeId: 3934369,
            sentenceDate: '2016-01-01',
            offenceDate: '2016-01-05',
            licenceExpiryDate: '2018-02-02',
            releaseDate: '2017-03-03',
            sentenceEndDate: '2019-04-04',
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

    const result = await updateSentence(bookingMemento, recommendation, 'token', { xyz: true })

    expect(ppudUpdateSentence).toHaveBeenCalledWith('token', '767', '444', {
      custodyType: 'Determinate',
      mappaLevel: 'Level 2 - local inter-agency management',
      dateOfSentence: '2016-01-01',
      licenceExpiryDate: '2018-02-02',
      releaseDate: '2017-03-03',
      sentenceExpiryDate: '2019-04-04',
      sentencingCourt: 'court desc',
      sentenceLength: {
        partDays: 1,
        partMonths: 2,
        partYears: 3,
      },
    })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookingMemento: {
          offenderId: '767',
          sentenceId: '444',
          stage: 'SENTENCE_BOOKED',
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
      stage: 'SENTENCE_BOOKED',
    })
  })
})
