import { faker } from '@faker-js/faker'
import { StageEnum } from './StageEnum'
import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { getStatuses, ppudUpdateRelease, updateRecommendation } from '../data/makeDecisionApiClient'
import updateRelease from './updateRelease'
import { STATUSES } from '../middleware/recommendationStatusCheck'
import { BookingMementoGenerator } from '../../data/bookingMemento/bookingMementoGenerator'
import BookingMemento from './BookingMemento'
import { RecommendationResponseGenerator } from '../../data/recommendations/recommendationGenerator'
import {
  PpudContact,
  PpudContactWithTelephone,
  PpudUpdateReleaseRequest,
} from '../@types/make-recall-decision-api/models/PpudUpdateReleaseRequest'
import { RecommendationStatusResponseGenerator } from '../../data/recommendationStatus/recommendationStatusResponseGenerator'
import { PpudUpdateReleaseResponseGenerator } from '../../data/ppud/updateRelease/ppudUpdateReleaseResponseGenerator'
import { CUSTODY_GROUP } from '../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import {
  PractitionerForPartA,
  WhoCompletedPartA,
} from '../@types/make-recall-decision-api/models/RecommendationResponse'

jest.mock('../data/makeDecisionApiClient')

const token = 'token'
const featureFlags = { xyz: true }

function buildExpectedUpdateReleaseRequest(
  recommendation: RecommendationResponse,
  dateOfRelease: string,
  assistantChiefOfficer: PpudContact,
  offenderManager: PpudContactWithTelephone
): PpudUpdateReleaseRequest {
  return {
    dateOfRelease,
    postRelease: {
      assistantChiefOfficer,
      offenderManager,
      spoc: {
        name: recommendation.bookRecallToPpud.policeForce,
        faxEmail: '',
      },
      probationService: recommendation.bookRecallToPpud.probationArea,
    },
    releasedFrom: recommendation.bookRecallToPpud.releasingPrison,
    releasedUnder: recommendation.bookRecallToPpud.legislationReleasedUnder,
  }
}

function testSuccessfulReleaseUpdate(
  recommendation: RecommendationResponse,
  offenderManager: PpudContactWithTelephone,
  dateOfRelease: string
) {
  const bookingMemento = BookingMementoGenerator.generate({
    stage: StageEnum.OFFENCE_BOOKED,
  })

  const releaseResponse = PpudUpdateReleaseResponseGenerator.generate()

  const expectedMemento: BookingMemento = {
    ...bookingMemento,
    releaseId: releaseResponse.release.id,
    stage: StageEnum.RELEASE_BOOKED,
    failed: undefined,
    failedMessage: undefined,
  }

  const recommendationStatuses = RecommendationStatusResponseGenerator.generateSeries([
    {
      active: true,
      name: STATUSES.ACO_SIGNED,
    },
    { active: true },
    { active: false },
  ])
  const acoSignedStatus = recommendationStatuses[0]
  const assistantChiefOfficer = {
    name: acoSignedStatus.createdByUserFullName,
    faxEmail: acoSignedStatus.emailAddress,
  }

  const expectedUpdateReleaseRequest = buildExpectedUpdateReleaseRequest(
    recommendation,
    dateOfRelease,
    assistantChiefOfficer,
    offenderManager
  )

  let returnedMemento: BookingMemento
  beforeEach(async () => {
    ;(getStatuses as jest.Mock).mockReturnValueOnce(recommendationStatuses)
    ;(ppudUpdateRelease as jest.Mock).mockReturnValueOnce(releaseResponse)
    ;(updateRecommendation as jest.Mock).mockReturnValueOnce(recommendation)

    returnedMemento = await updateRelease(bookingMemento, recommendation, token, featureFlags)
  })
  it('gets the recommendation statuses', () => {
    expect(getStatuses).toHaveBeenCalledWith({
      recommendationId: recommendation.id.toString(),
      token,
    })
  })
  it('updates the release in PPUD', () => {
    expect(ppudUpdateRelease).toHaveBeenCalledWith(
      token,
      bookingMemento.offenderId,
      bookingMemento.sentenceId,
      expectedUpdateReleaseRequest
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
}

function testSuccessfulReleaseUpdateAlternatives(
  custodyGroup: CUSTODY_GROUP,
  calculateExpectedDateOfRelease: (recommendation: RecommendationResponse) => string
) {
  ;[true, false].forEach(isPersonProbationPractitionerForOffender => {
    describe(`probation practitioner ${isPersonProbationPractitionerForOffender ? 'completed' : 'did not complete'} the part A`, () => {
      const recommendation = RecommendationResponseGenerator.generate({
        bookRecallToPpud: { custodyGroup },
      })
      recommendation.whoCompletedPartA.isPersonProbationPractitionerForOffender =
        isPersonProbationPractitionerForOffender
      recommendation.bookRecallToPpud.ppudSentenceId = recommendation.ppudOffender.sentences[0].id
      const partACompleter: WhoCompletedPartA | PractitionerForPartA = isPersonProbationPractitionerForOffender
        ? recommendation.whoCompletedPartA
        : recommendation.practitionerForPartA
      const offenderManager: PpudContactWithTelephone = {
        name: partACompleter.name || '',
        faxEmail: partACompleter.email || '',
        telephone: partACompleter.telephone || '',
      }
      const dateOfRelease = calculateExpectedDateOfRelease(recommendation)
      testSuccessfulReleaseUpdate(recommendation, offenderManager, dateOfRelease)
    })
  })
}

describe('update release', () => {
  describe('not in expected stage', () => {
    const bookingMemento = BookingMementoGenerator.generate({
      stage: faker.helpers.arrayElement(
        Object.values(StageEnum).filter((stage: StageEnum) => stage !== StageEnum.OFFENCE_BOOKED)
      ),
    })
    let returnedMemento: BookingMemento
    beforeEach(async () => {
      const recommendation = RecommendationResponseGenerator.generate()
      returnedMemento = await updateRelease(bookingMemento, recommendation, token, featureFlags)
    })
    it('- returns booking memento unchanged', () => {
      expect(returnedMemento).toEqual(bookingMemento)
    })
    it('- makes no calls', () => {
      expect(getStatuses).not.toHaveBeenCalled()
      expect(ppudUpdateRelease).not.toHaveBeenCalled()
      expect(updateRecommendation).not.toHaveBeenCalled()
    })
  })

  describe('in expected stage', () => {
    describe('for determinate sentence', () => {
      const calculateExpectedDateOfRelease = (recommendation: RecommendationResponse): string => {
        return recommendation.nomisIndexOffence.allOptions[0].releaseDate
      }

      testSuccessfulReleaseUpdateAlternatives(CUSTODY_GROUP.DETERMINATE, calculateExpectedDateOfRelease)
    })
    describe('for indeterminate sentence', () => {
      const calculateExpectedDateOfRelease = (recommendation: RecommendationResponse): string => {
        return recommendation.bookRecallToPpud.ppudIndeterminateSentenceData.releaseDate
      }

      testSuccessfulReleaseUpdateAlternatives(CUSTODY_GROUP.INDETERMINATE, calculateExpectedDateOfRelease)
    })
  })
})
