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

jest.mock('../data/makeDecisionApiClient')

const token = 'token'
const featureFlags = { xyz: true }

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
        return recommendation.ppudOffender.sentences[0].releaseDate
      }

      testSuccessfulReleaseUpdateAlternatives(CUSTODY_GROUP.INDETERMINATE, calculateExpectedDateOfRelease)
    })
  })
})

function testSuccessfulReleaseUpdateAlternatives(
  custodyGroup: CUSTODY_GROUP,
  calculateExpectedDateOfRelease: (recommendation: RecommendationResponse) => string
) {
  describe('probation practitioner completed the part A', () => {
    const recommendationCompletedByProbationPractitioner = RecommendationResponseGenerator.generate({
      whoCompletedPartA: true,
      bookRecallToPpud: { custodyGroup },
    })
    recommendationCompletedByProbationPractitioner.whoCompletedPartA.isPersonProbationPractitionerForOffender = true
    recommendationCompletedByProbationPractitioner.bookRecallToPpud.ppudSentenceId =
      recommendationCompletedByProbationPractitioner.ppudOffender.sentences[0].id
    const offenderManager: PpudContactWithTelephone = {
      name: recommendationCompletedByProbationPractitioner.whoCompletedPartA.name,
      faxEmail: recommendationCompletedByProbationPractitioner.whoCompletedPartA.email,
      telephone: recommendationCompletedByProbationPractitioner.whoCompletedPartA.telephone,
    }
    const dateOfRelease = calculateExpectedDateOfRelease(recommendationCompletedByProbationPractitioner)
    testSuccessfulReleaseUpdate(recommendationCompletedByProbationPractitioner, offenderManager, dateOfRelease)
  })
  describe('probation practitioner did not complete the part A', () => {
    const recommendationCompletedByAdminWorker = RecommendationResponseGenerator.generate({
      whoCompletedPartA: true,
      bookRecallToPpud: { custodyGroup },
    })
    recommendationCompletedByAdminWorker.whoCompletedPartA.isPersonProbationPractitionerForOffender = false
    recommendationCompletedByAdminWorker.bookRecallToPpud.ppudSentenceId =
      recommendationCompletedByAdminWorker.ppudOffender.sentences[0].id
    const offenderManager = {
      name: recommendationCompletedByAdminWorker.practitionerForPartA.name,
      faxEmail: recommendationCompletedByAdminWorker.practitionerForPartA.email,
      telephone: recommendationCompletedByAdminWorker.practitionerForPartA.telephone,
    }
    const dateOfRelease = calculateExpectedDateOfRelease(recommendationCompletedByAdminWorker)
    testSuccessfulReleaseUpdate(recommendationCompletedByAdminWorker, offenderManager, dateOfRelease)
  })
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

  const expectedMemento = {
    ...bookingMemento,
    releaseId: releaseResponse.release.id,
    stage: StageEnum.RELEASE_BOOKED,
  }
  delete expectedMemento.failed
  delete expectedMemento.failedMessage

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
