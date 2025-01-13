import { StageEnum } from './StageEnum'
import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { ppudCreateSentence, ppudUpdateSentence, updateRecommendation } from '../data/makeDecisionApiClient'
import createOrUpdateSentence from './createOrUpdateSentence'

jest.mock('../data/makeDecisionApiClient')

describe('update sentence', () => {
  it('happy path - stage has passed', async () => {
    const bookingMemento = {
      stage: StageEnum.SENTENCE_BOOKED,
    }

    const result = await createOrUpdateSentence(bookingMemento, {}, 'token', { xyz: true })

    expect(ppudUpdateSentence).not.toHaveBeenCalled()
    expect(bookingMemento).toEqual(result)
  })

  it('happy path - update sentence', async () => {
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

    const token = 'token'

    const featureFlags = { xyz: true }

    const result = await createOrUpdateSentence(bookingMemento, recommendation, token, featureFlags)

    expect(ppudUpdateSentence).toHaveBeenCalledWith(token, bookingMemento.offenderId, bookingMemento.sentenceId, {
      custodyType: recommendation.bookRecallToPpud.custodyType,
      mappaLevel: recommendation.bookRecallToPpud.mappaLevel,
      dateOfSentence: recommendation.nomisIndexOffence.allOptions[0].sentenceDate,
      licenceExpiryDate: recommendation.nomisIndexOffence.allOptions[0].licenceExpiryDate,
      releaseDate: recommendation.nomisIndexOffence.allOptions[0].releaseDate,
      sentenceExpiryDate: recommendation.nomisIndexOffence.allOptions[0].sentenceEndDate,
      sentencingCourt: recommendation.nomisIndexOffence.allOptions[0].courtDescription,
      sentenceLength: {
        partDays: recommendation.nomisIndexOffence.allOptions[0].terms[0].days,
        partMonths: recommendation.nomisIndexOffence.allOptions[0].terms[0].months,
        partYears: recommendation.nomisIndexOffence.allOptions[0].terms[0].years,
      },
    })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: recommendation.id,
      valuesToSave: {
        bookingMemento: {
          offenderId: bookingMemento.offenderId,
          sentenceId: bookingMemento.sentenceId,
          stage: 'SENTENCE_BOOKED',
        },
      },
      token,
      featureFlags,
    })
    expect(result).toEqual({
      offenderId: bookingMemento.offenderId,
      sentenceId: bookingMemento.sentenceId,
      stage: 'SENTENCE_BOOKED',
    })
  })

  it('happy path - create sentence', async () => {
    const bookingMemento = {
      stage: StageEnum.OFFENDER_BOOKED,
      offenderId: '767',
      sentenceId: 'ADD_NEW',
      failed: true,
      failedMessage: '{}',
    }

    const recommendation: RecommendationResponse = {
      id: '1',
      bookRecallToPpud: {
        custodyType: 'Determinate',
        mappaLevel: 'Level 2 - local inter-agency management',
        ppudSentenceId: 'ADD_NEW',
        legislationReleasedUnder: 'CJA 2023',
        legislationSentencedUnder: 'CJA 2023',
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

    const sentence = { id: '445' }
    ;(ppudCreateSentence as jest.Mock).mockResolvedValue({ sentence })

    const token = 'token'

    const featureFlags = { xyz: true }

    const result = await createOrUpdateSentence(bookingMemento, recommendation, token, featureFlags)

    expect(ppudCreateSentence).toHaveBeenCalledWith(token, bookingMemento.offenderId, {
      custodyType: recommendation.bookRecallToPpud.custodyType,
      mappaLevel: recommendation.bookRecallToPpud.mappaLevel,
      dateOfSentence: recommendation.nomisIndexOffence.allOptions[0].sentenceDate,
      licenceExpiryDate: recommendation.nomisIndexOffence.allOptions[0].licenceExpiryDate,
      releaseDate: recommendation.nomisIndexOffence.allOptions[0].releaseDate,
      sentenceExpiryDate: recommendation.nomisIndexOffence.allOptions[0].sentenceEndDate,
      sentencingCourt: recommendation.nomisIndexOffence.allOptions[0].courtDescription,
      sentencedUnder: recommendation.bookRecallToPpud.legislationSentencedUnder,
      sentenceLength: {
        partDays: recommendation.nomisIndexOffence.allOptions[0].terms[0].days,
        partMonths: recommendation.nomisIndexOffence.allOptions[0].terms[0].months,
        partYears: recommendation.nomisIndexOffence.allOptions[0].terms[0].years,
      },
    })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: recommendation.id,
      valuesToSave: {
        bookingMemento: {
          offenderId: bookingMemento.offenderId,
          sentenceId: sentence.id,
          stage: 'SENTENCE_BOOKED',
        },
      },
      token,
      featureFlags,
    })
    expect(result).toEqual({
      offenderId: bookingMemento.offenderId,
      sentenceId: sentence.id,
      stage: 'SENTENCE_BOOKED',
    })
  })
})
