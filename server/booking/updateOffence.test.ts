import { faker } from '@faker-js/faker'
import { StageEnum } from './StageEnum'
import { ppudUpdateOffence, updateRecommendation } from '../data/makeDecisionApiClient'
import updateOffence from './updateOffence'
import { BookingMementoGenerator } from '../../data/bookingMemento/bookingMementoGenerator'
import BookingMemento from './BookingMemento'
import { RecommendationResponseGenerator } from '../../data/recommendations/recommendationGenerator'

jest.mock('../data/makeDecisionApiClient')

const token = 'token'
const featureFlags = { xyz: true }

describe('update offence', () => {
  describe('not in expected stage', () => {
    const bookingMemento = BookingMementoGenerator.generate({
      stage: faker.helpers.arrayElement(
        Object.values(StageEnum).filter((stage: StageEnum) => stage !== StageEnum.SENTENCE_BOOKED)
      ),
    })
    let returnedMemento: BookingMemento
    beforeEach(async () => {
      const recommendation = RecommendationResponseGenerator.generate()
      returnedMemento = await updateOffence(bookingMemento, recommendation, token, featureFlags)
    })
    it('- returns booking memento', () => {
      expect(returnedMemento).toEqual(bookingMemento)
    })
    it('- makes no calls', () => {
      expect(ppudUpdateOffence).not.toHaveBeenCalled()
      expect(updateRecommendation).not.toHaveBeenCalled()
    })
  })

  describe('in expected stage', () => {
    const bookingMemento = BookingMementoGenerator.generate({
      stage: StageEnum.SENTENCE_BOOKED,
    })
    const recommendation = RecommendationResponseGenerator.generate()

    const expectedMemento = {
      ...bookingMemento,
      stage: StageEnum.OFFENCE_BOOKED,
    }
    delete expectedMemento.failed
    delete expectedMemento.failedMessage

    let returnedMemento: BookingMemento
    beforeEach(async () => {
      ;(ppudUpdateOffence as jest.Mock).mockImplementationOnce(() => Promise.resolve())
      ;(updateRecommendation as jest.Mock).mockReturnValueOnce(recommendation)

      returnedMemento = await updateOffence(bookingMemento, recommendation, token, featureFlags)
    })
    it('updates the PPUD offence', () => {
      expect(ppudUpdateOffence).toHaveBeenCalledWith(token, bookingMemento.offenderId, bookingMemento.sentenceId, {
        indexOffence: recommendation.bookRecallToPpud.indexOffence,
        indexOffenceComment: recommendation.bookRecallToPpud.indexOffenceComment,
        dateOfIndexOffence: recommendation.nomisIndexOffence.allOptions[0].offenceDate,
      })
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
    it('returns updated memento', () => {
      expect(returnedMemento).toEqual(expectedMemento)
    })
  })
})
