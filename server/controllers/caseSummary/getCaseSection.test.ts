import { createClient } from 'redis'
import { getCaseSection } from './getCaseSection'
import { getCaseSummary, getCaseSummaryV2 } from '../../data/makeDecisionApiClient'
import {
  ContactHistoryResponse,
  LastCompletedRecommendationsResponse,
  RecommendationResponse,
  VulnerabilitiesResponse,
} from '../../@types/make-recall-decision-api'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('redis')

describe('getCaseSection', () => {
  const crn = ' A1234AB '
  const token = 'token'
  const userId = 'a123-b456'
  const redisGet = jest.fn()
  const redisSet = jest.fn()
  const redisDel = jest.fn()
  const redisExpire = jest.fn()

  beforeEach(() => {
    ;(createClient as jest.Mock).mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      get: redisGet,
      set: redisSet,
      expire: redisExpire,
      del: redisDel,
      on: jest.fn(),
    })
  })

  it('caches the contact history response in redis if CRN is not excluded or restricted', async () => {
    const apiResponse = {
      contactTypeGroups: [
        {
          groupId: '1',
          label: 'Accredited programme',
          contactTypeCodes: ['C191', 'IVSP'],
        },
      ],
      contactSummary: [
        {
          code: 'C191',
          contactStartDate: '2022-06-03T08:00:00',
          descriptionType: 'Registration Review',
          outcome: null,
          notes:
            'Comment added by John Smith on 05/05/2022 at 17:45\nType: Public Protection - MAPPA\nLevel: MAPPA Level 3\nCategory: MAPPA Cat 3\nNotes: Please Note - Category 3 offenders require multi-agency management at Level 2 or 3 and should not be recorded at Level 1.',
          enforcementAction: 'action 2',
          systemGenerated: false,
        },
      ],
    } as ContactHistoryResponse
    ;(getCaseSummary as jest.Mock).mockResolvedValue(apiResponse)
    redisGet.mockResolvedValue(null)
    await getCaseSection('contact-history', crn, token, userId, {}, {})
    expect(redisSet).toHaveBeenCalledWith(
      'contactHistory:A1234AB',
      JSON.stringify({ userIds: [userId], data: apiResponse })
    )
  })

  it('returns last completed section', async () => {
    const apiResponse = {
      recommendations: [
        {
          recommendationId: 427954240,
          lastModifiedByName: 'Making Recall Decisions SPO User',
          createdDate: '2023-07-31T08:16:11.345Z',
          lastModifiedDate: '2023-07-31T08:18:53.182Z',
          status: 'DRAFT',
          statuses: [
            {
              recommendationId: 427954240,
              createdBy: 'MAKE_RECALL_DECISION_SPO_USER',
              createdByUserFullName: 'Making Recall Decisions SPO User',
              created: '2023-07-31T08:18:53.361Z',
              name: 'COMPLETED',
              active: true,
            },
          ],
          recallType: {
            selected: { value: 'STANDARD', details: 'test' },
          },
        },
      ],
    }

    ;(getCaseSummary as jest.Mock).mockResolvedValue(apiResponse)
    const { caseSummary } = await getCaseSection('last-completed', crn, token, userId, {}, {})

    const recs = caseSummary as LastCompletedRecommendationsResponse
    expect(recs.recommendations[0].recallType).toBe('STANDARD')
    expect(recs.recommendations[0].completedDate).toBe('2023-07-31T08:18:53.361Z')
  })

  it('returns licence-conditions - CVL Flag', async () => {
    const apiResponse = {
      activeConvictions: [
        {
          sentence: {
            description: 'Extended Determinate Sentence',
            isCustodial: true,
            custodialStatusCode: 'B',
          },
          licenceConditions: [
            {
              startDate: '2022-04-24',
            },
          ],
        },
      ],
      activeRecommendation: {
        recommendationId: 1860300544,
      },
      cvlLicence: {
        licenceStatus: 'ACTIVE',
        conditionalReleaseDate: '2022-06-10',
      },
      hasAllConvictionsReleasedOnLicence: true,
      personalDetailsOverview: {
        fullName: 'Harry Tom Smith',
      },
    }

    ;(getCaseSummaryV2 as jest.Mock).mockResolvedValue(apiResponse)
    const { caseSummary } = await getCaseSection('licence-conditions', crn, token, userId, {}, { flagCvl: true })

    const recs = caseSummary as Record<string, unknown>
    expect(recs.licenceConvictions).toStrictEqual({
      activeCustodial: [
        {
          licenceConditions: [
            {
              startDate: '2022-04-24',
            },
          ],
          sentence: {
            custodialStatusCode: 'B',
            description: 'Extended Determinate Sentence',
            isCustodial: true,
          },
        },
      ],
      hasMultipleActiveCustodial: false,
    })
    expect(recs.cvlLicence).toStrictEqual({
      licenceStatus: 'ACTIVE',
      conditionalReleaseDate: '2022-06-10',
    })
    expect(recs.hasAllConvictionsReleasedOnLicence).toStrictEqual(true)
    expect(recs.personalDetailsOverview).toStrictEqual({
      fullName: 'Harry Tom Smith',
    })
    expect(recs.activeRecommendation).toStrictEqual({
      recommendationId: 1860300544,
    })
  })

  describe('Excluded', () => {
    const apiResponse = {
      userAccessResponse: {
        userExcluded: true,
      },
    } as ContactHistoryResponse

    beforeEach(() => {
      ;(getCaseSummary as jest.Mock).mockResolvedValue(apiResponse)
    })

    it('does not cache the contact history response in redis if CRN is excluded', async () => {
      redisGet.mockResolvedValue(null)
      const { section } = await getCaseSection('contact-history', crn, token, userId, {}, {})
      expect(redisSet).not.toHaveBeenCalled()
      expect(redisDel).toHaveBeenCalledWith('contactHistory:A1234AB')
      expect(section.label).toEqual('Contact history')
    })

    it('returns excluded data for contact history', async () => {
      const { caseSummary } = await getCaseSection('contact-history', crn, token, userId, {}, {})
      expect((caseSummary as ContactHistoryResponse).userAccessResponse.userExcluded).toEqual(true)
    })

    it('returns excluded data for licence conditions', async () => {
      const { caseSummary } = await getCaseSection('licence-conditions', crn, token, userId, {}, {})
      expect((caseSummary as ContactHistoryResponse).userAccessResponse.userExcluded).toEqual(true)
    })

    it('returns excluded data for personal details', async () => {
      const { caseSummary } = await getCaseSection('personal-details', crn, token, userId, {}, {})
      expect((caseSummary as ContactHistoryResponse).userAccessResponse.userExcluded).toEqual(true)
    })

    it('returns excluded data for vulnerabilities', async () => {
      const { caseSummary } = await getCaseSection('vulnerabilities', crn, token, userId, {}, {})
      expect((caseSummary as VulnerabilitiesResponse).userAccessResponse.userExcluded).toEqual(true)
    })

    it('returns excluded data for risk', async () => {
      const { caseSummary } = await getCaseSection('risk', crn, token, userId, {}, {})
      expect((caseSummary as ContactHistoryResponse).userAccessResponse.userExcluded).toEqual(true)
    })

    it('returns excluded data for recommendations', async () => {
      const { caseSummary } = await getCaseSection('recommendations', crn, token, userId, {}, {})
      expect((caseSummary as RecommendationResponse).userAccessResponse.userExcluded).toEqual(true)
    })

    it('returns excluded data for last-completed', async () => {
      const { caseSummary } = await getCaseSection('last-completed', crn, token, userId, {}, {})
      expect((caseSummary as RecommendationResponse).userAccessResponse.userExcluded).toEqual(true)
    })
  })

  describe('Restricted', () => {
    const apiResponse = {
      userAccessResponse: {
        userRestricted: true,
      },
    } as ContactHistoryResponse

    beforeEach(() => {
      ;(getCaseSummary as jest.Mock).mockResolvedValue(apiResponse)
    })

    it('does not cache the contact history response in redis if CRN is restricted', async () => {
      redisGet.mockResolvedValue(null)
      const { section } = await getCaseSection('contact-history', crn, token, userId, {}, {})
      expect(redisSet).not.toHaveBeenCalled()
      expect(redisDel).toHaveBeenCalledWith('contactHistory:A1234AB')
      expect(section.label).toEqual('Contact history')
    })

    it('returns restricted data for contact history', async () => {
      const { caseSummary } = await getCaseSection('contact-history', crn, token, userId, {}, {})
      expect((caseSummary as ContactHistoryResponse).userAccessResponse.userRestricted).toEqual(true)
    })

    it('returns restricted data for licence conditions', async () => {
      const { caseSummary } = await getCaseSection('licence-conditions', crn, token, userId, {}, {})
      expect((caseSummary as ContactHistoryResponse).userAccessResponse.userRestricted).toEqual(true)
    })

    it('returns restricted data for personal details', async () => {
      const { caseSummary } = await getCaseSection('personal-details', crn, token, userId, {}, {})
      expect((caseSummary as ContactHistoryResponse).userAccessResponse.userRestricted).toEqual(true)
    })

    it('returns restricted data for vulnerabilities', async () => {
      const { caseSummary } = await getCaseSection('vulnerabilities', crn, token, userId, {}, {})
      expect((caseSummary as VulnerabilitiesResponse).userAccessResponse.userRestricted).toEqual(true)
    })

    it('returns restricted data for risk', async () => {
      const { caseSummary } = await getCaseSection('risk', crn, token, userId, {}, {})
      expect((caseSummary as ContactHistoryResponse).userAccessResponse.userRestricted).toEqual(true)
    })

    it('returns restricted data for recommendations', async () => {
      const { caseSummary } = await getCaseSection('recommendations', crn, token, userId, {}, {})
      expect((caseSummary as RecommendationResponse).userAccessResponse.userRestricted).toEqual(true)
    })

    it('returns restricted data for last-completed', async () => {
      const { caseSummary } = await getCaseSection('last-completed', crn, token, userId, {}, {})
      expect((caseSummary as RecommendationResponse).userAccessResponse.userRestricted).toEqual(true)
    })
  })
})
