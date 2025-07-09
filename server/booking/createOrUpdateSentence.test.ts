import { faker } from '@faker-js/faker'
import { StageEnum } from './StageEnum'
import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { ppudCreateSentence, ppudUpdateSentence, updateRecommendation } from '../data/makeDecisionApiClient'
import createOrUpdateSentence from './createOrUpdateSentence'
import { RecommendationResponseGenerator } from '../../data/recommendations/recommendationGenerator'
import { CUSTODY_GROUP } from '../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { BookingMementoGenerator } from '../../data/bookingMemento/bookingMementoGenerator'
import BookingMemento from './BookingMemento'
import { PpudCreateSentenceResponseGenerator } from '../../data/ppud/createSentenceResponse/ppudCreateSentenceResponseGenerator'
import { TermOptions } from '../../data/common/termGenerator'
import { OfferedOffenceGenerator } from '../../data/recommendations/offeredOffenceGenerator'
import {
  PpudUpdateSentenceRequest,
  SentenceLength,
} from '../@types/make-recall-decision-api/models/PpudUpdateSentenceRequest'
import {
  BookRecallToPpud,
  OfferedOffence,
  PpudSentence,
} from '../@types/make-recall-decision-api/models/RecommendationResponse'

jest.mock('../data/makeDecisionApiClient')

const token = 'token'
const featureFlags = { xyz: true }

function expectedDeterminateSentenceRequest(
  bookRecallToPpud: BookRecallToPpud,
  nomisOffence: OfferedOffence,
  sentenceLength: SentenceLength
): PpudUpdateSentenceRequest {
  return {
    custodyType: bookRecallToPpud?.custodyType,
    mappaLevel: bookRecallToPpud?.mappaLevel,
    dateOfSentence: nomisOffence.sentenceDate,
    licenceExpiryDate: nomisOffence.licenceExpiryDate,
    releaseDate: nomisOffence.releaseDate,
    sentenceLength,
    sentenceExpiryDate: nomisOffence.sentenceEndDate,
    sentencingCourt: nomisOffence.courtDescription,
    sentencedUnder: bookRecallToPpud?.legislationSentencedUnder,
  }
}

function expectedIndeterminateSentenceRequest(selectedPpudSentence: PpudSentence): PpudUpdateSentenceRequest {
  return {
    custodyType: selectedPpudSentence.custodyType,
    dateOfSentence: selectedPpudSentence.dateOfSentence,
    releaseDate: selectedPpudSentence.releaseDate,
    sentencingCourt: selectedPpudSentence.sentencingCourt,
  }
}

function testSentenceCreation(
  recommendation: RecommendationResponse,
  bookingMemento: BookingMemento,
  expectedSentenceRequest: PpudUpdateSentenceRequest
) {
  const recommendationForCreation = {
    ...recommendation,
    bookRecallToPpud: {
      ...recommendation.bookRecallToPpud,
      ppudSentenceId: 'ADD_NEW',
    },
  }

  const expectedMemento = {
    ...bookingMemento,
    stage: StageEnum.SENTENCE_BOOKED,
  }
  delete expectedMemento.failed
  delete expectedMemento.failedMessage

  let returnedMemento: BookingMemento

  describe('- adding new sentence to PPUD', () => {
    beforeEach(async () => {
      const createPpudSentenceResponse = PpudCreateSentenceResponseGenerator.generate()
      ;(ppudCreateSentence as jest.Mock).mockResolvedValue(createPpudSentenceResponse)
      expectedMemento.sentenceId = createPpudSentenceResponse.sentence.id
      ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationForCreation)

      returnedMemento = await createOrUpdateSentence(bookingMemento, recommendationForCreation, token, featureFlags)
    })

    it('calls ppudCreateSentence', () => {
      expect(ppudCreateSentence).toHaveBeenCalledWith(token, bookingMemento.offenderId, expectedSentenceRequest)
    })
    it('updates the recommendation', () => {
      expect(updateRecommendation).toHaveBeenCalledWith({
        recommendationId: recommendationForCreation.id.toString(),
        valuesToSave: {
          bookingMemento: expectedMemento,
        },
        token,
        featureFlags,
      })
    })
    it('returns an updated memento', () => {
      expect(returnedMemento).toEqual(expectedMemento)
    })
  })
}

function testSentenceUpdate(
  recommendation: RecommendationResponse,
  bookingMemento: BookingMemento,
  expectedSentenceRequest: PpudUpdateSentenceRequest
) {
  describe('- updating existing PPUD sentence', () => {
    const expectedMemento = {
      ...bookingMemento,
      stage: StageEnum.SENTENCE_BOOKED,
    }
    delete expectedMemento.failed
    delete expectedMemento.failedMessage

    let returnedMemento: BookingMemento
    beforeEach(async () => {
      ;(ppudUpdateSentence as jest.Mock).mockImplementationOnce(() => Promise.resolve())
      ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendation)

      returnedMemento = await createOrUpdateSentence(bookingMemento, recommendation, token, featureFlags)
    })
    it('calls ppudUpdateSentence', () => {
      expect(ppudUpdateSentence).toHaveBeenCalledWith(
        token,
        bookingMemento.offenderId,
        bookingMemento.sentenceId,
        expectedSentenceRequest
      )
    })
    it('updates the recommendation', () => {
      expect(updateRecommendation).toHaveBeenCalledWith({
        recommendationId: recommendation.id.toString(),
        valuesToSave: {
          bookingMemento: expectedMemento,
        },
        token,
        featureFlags,
      })
    })
    it('returns an updated memento', () => {
      expect(returnedMemento).toEqual(expectedMemento)
    })
  })
}

describe('update sentence', () => {
  describe('not in expected stage', () => {
    const bookingMemento = BookingMementoGenerator.generate({
      stage: faker.helpers.arrayElement(
        Object.values(StageEnum).filter((stage: StageEnum) => stage !== StageEnum.OFFENDER_BOOKED)
      ),
    })
    let returnedMemento: BookingMemento
    beforeEach(async () => {
      const recommendation = RecommendationResponseGenerator.generate()
      returnedMemento = await createOrUpdateSentence(bookingMemento, recommendation, token, featureFlags)
    })
    it('- returns booking memento', () => {
      expect(returnedMemento).toEqual(bookingMemento)
    })
    it('- makes no calls', () => {
      expect(ppudCreateSentence).not.toHaveBeenCalled()
      expect(ppudUpdateSentence).not.toHaveBeenCalled()
      expect(updateRecommendation).not.toHaveBeenCalled()
    })
  })

  describe('in expected stage', () => {
    const bookingMemento = BookingMementoGenerator.generate({
      stage: StageEnum.OFFENDER_BOOKED,
    })
    describe('for determinate sentence', () => {
      const recommendation: RecommendationResponse = RecommendationResponseGenerator.generate({
        bookRecallToPpud: { custodyGroup: CUSTODY_GROUP.DETERMINATE },
      })
      describe('with a selected index offence with no custodial term', () => {
        const recommendationWithoutCustodialTerm = {
          ...recommendation,
        }
        const expectedSentenceRequest = expectedDeterminateSentenceRequest(
          recommendationWithoutCustodialTerm.bookRecallToPpud,
          recommendationWithoutCustodialTerm.nomisIndexOffence.allOptions[0],
          null
        )

        testSentenceCreation(recommendationWithoutCustodialTerm, bookingMemento, expectedSentenceRequest)

        testSentenceUpdate(recommendationWithoutCustodialTerm, bookingMemento, expectedSentenceRequest)
      })

      describe('with a selected index offence with a custodial term', () => {
        const custodialTermCode = 'IMP'
        const termOptions: TermOptions[] = [{ chronos: 'all', code: custodialTermCode }, {}, {}]
        const recommendationWithCustodialTerm = {
          ...recommendation,
          nomisIndexOffence: {
            ...recommendation.nomisIndexOffence,
            allOptions: OfferedOffenceGenerator.generateSeries([
              {
                offenderChargeId: recommendation.nomisIndexOffence.selected,
                terms: termOptions,
              },
              {},
              {},
            ]),
          },
        }
        const selectedOffence = recommendationWithCustodialTerm.nomisIndexOffence.allOptions[0]
        const custodialTerm = selectedOffence.terms[0]
        const expectedSentenceLength = {
          partDays: custodialTerm.days,
          partMonths: custodialTerm.months,
          partYears: custodialTerm.years,
        }
        const expectedSentenceRequest = expectedDeterminateSentenceRequest(
          recommendationWithCustodialTerm.bookRecallToPpud,
          recommendationWithCustodialTerm.nomisIndexOffence.allOptions[0],
          expectedSentenceLength
        )

        testSentenceCreation(recommendationWithCustodialTerm, bookingMemento, expectedSentenceRequest)

        testSentenceUpdate(recommendationWithCustodialTerm, bookingMemento, expectedSentenceRequest)
      })
    })

    describe('for indeterminate sentence', () => {
      const recommendation: RecommendationResponse = RecommendationResponseGenerator.generate({
        bookRecallToPpud: { custodyGroup: CUSTODY_GROUP.INDETERMINATE },
      })
      const selectedPpudSentence = recommendation.ppudOffender.sentences[0]
      recommendation.bookRecallToPpud.ppudSentenceId = selectedPpudSentence.id
      const expectedSentenceRequest = expectedIndeterminateSentenceRequest(selectedPpudSentence)

      testSentenceUpdate(recommendation, bookingMemento, expectedSentenceRequest)
    })
  })
})
