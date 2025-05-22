import { StageEnum } from './StageEnum'
import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { getStatuses, ppudUpdateRelease, updateRecommendation } from '../data/makeDecisionApiClient'
import updateRelease from './updateRelease'
import { STATUSES } from '../middleware/recommendationStatusCheck'

jest.mock('../data/makeDecisionApiClient')

describe('update release', () => {
  it('happy path - stage has passed', async () => {
    const bookingMemento = {
      stage: StageEnum.RELEASE_BOOKED,
    }

    const result = await updateRelease(bookingMemento, {}, 'token', { xyz: true })

    expect(ppudUpdateRelease).not.toHaveBeenCalled()
    expect(bookingMemento).toEqual(result)
  })

  it('happy path', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([
      {
        name: STATUSES.ACO_SIGNED,
        createdByUserFullName: 'Mr Bloggs',
        emailAddress: 'email@me.com',
        active: true,
      },
    ])
    ;(ppudUpdateRelease as jest.Mock).mockResolvedValue({ release: { id: '555' } })

    const bookingMemento = {
      stage: StageEnum.OFFENCE_BOOKED,
      offenderId: '767',
      sentenceId: '444',
      failed: true,
      failedMessage: '{}',
    }

    const recommendation: RecommendationResponse = {
      id: '1',
      whoCompletedPartA: {
        name: 'john',
        email: 'john@me.com',
        telephone: '123456',
        region: 'region A',
        localDeliveryUnit: 'here',
        isPersonProbationPractitionerForOffender: true,
      },
      bookRecallToPpud: {
        releasingPrison: 'here',
        policeForce: 'Bethnal Green Police Force',
        probationArea: 'london',
        legislationReleasedUnder: 'CJA 2023',
        legislationSentencedUnder: 'CJA 2023',
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

    const result = await updateRelease(bookingMemento, recommendation, 'token', { xyz: true })

    expect(ppudUpdateRelease).toHaveBeenCalledWith('token', '767', '444', {
      dateOfRelease: '2017-03-03',
      postRelease: {
        assistantChiefOfficer: {
          faxEmail: 'email@me.com',
          name: 'Mr Bloggs',
        },
        offenderManager: {
          faxEmail: 'john@me.com',
          name: 'john',
          telephone: '123456',
        },
        probationService: 'london',
        spoc: {
          faxEmail: '',
          name: 'Bethnal Green Police Force',
        },
      },
      releasedFrom: 'here',
      releasedUnder: 'CJA 2023',
    })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookingMemento: {
          offenderId: '767',
          sentenceId: '444',
          releaseId: '555',
          stage: 'RELEASE_BOOKED',
        },
      },
      token: 'token',
      featureFlags: {
        xyz: true,
      },
    })
    expect(result).toEqual({
      offenderId: '767',
      releaseId: '555',
      sentenceId: '444',
      stage: 'RELEASE_BOOKED',
    })
  })
})
