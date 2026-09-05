import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import addMinuteController from './addMinuteController'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'
import CUSTODY_GROUP from '../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'
import generateRecallMinuteText from '../recommendations/helpers/ppudMinutes'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'

jest.mock('../../data/makeDecisionApiClient')

jest.mock('../recommendations/helpers/ppudMinutes', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const generateRecallMinuteTextMock = generateRecallMinuteText as jest.MockedFunction<typeof generateRecallMinuteText>

const MOCK_GENERATED_MINUTE = 'Generated default minute'

const getRecommendationMock = (sentenceGroup: SentenceGroup): RecommendationResponse => {
  return RecommendationResponseGenerator.generate({
    sentenceGroup,
    prisonOffender: {
      status: 'ACTIVE IN',
      locationDescription: 'Glasgow Prison',
    },
    bookRecallToPpud: {},
    nomisIndexOffence: {
      selectedIndex: 123,
      offeredOffenceOptions: [
        {
          offenderChargeId: 123,
        },
      ],
    },
  })
}

describe('get', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    generateRecallMinuteTextMock.mockReturnValue(MOCK_GENERATED_MINUTE)
  })

  it('loads the saved minute when one exists', async () => {
    const recommendation = RecommendationResponseGenerator.generate()

    const res = mockRes({
      locals: {
        recommendation: {
          ...recommendation,
          bookRecallToPpud: {
            minute: 'Previous Minute updated notes',
          },
        },
      },
    })

    const req = mockReq()
    const next = mockNext()

    await addMinuteController.get(req, res, next)

    expect(res.locals.page).toEqual({ id: 'addMinute' })
    expect(res.locals.minute).toEqual('Previous Minute updated notes')
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/addMinute')
    expect(next).toHaveBeenCalled()

    expect(generateRecallMinuteTextMock).not.toHaveBeenCalled()
  })

  it('generates the default minute when no minute has been saved', async () => {
    const recommendation = getRecommendationMock(SentenceGroup.EXTENDED)

    const res = mockRes({
      locals: {
        recommendation,
      },
    })

    const req = mockReq()
    const next = mockNext()

    await addMinuteController.get(req, res, next)

    expect(generateRecallMinuteTextMock).toHaveBeenCalledWith(recommendation)
    expect(res.locals.page).toEqual({ id: 'addMinute' })
    expect(res.locals.minute).toEqual(MOCK_GENERATED_MINUTE)
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/addMinute')
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('saves the minute and redirects to the next page', async () => {
    const recommendation = RecommendationResponseGenerator.generate({
      id: 1,
      bookRecallToPpud: {
        policeForce: 'Kent',
        custodyGroup: CUSTODY_GROUP.DETERMINATE,
      },
    })
    const USER_UPDATED_MINUTE = 'user updated minutes'

    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendation)

    const req = mockReq({
      params: {
        recommendationId: '1234',
      },
      body: {
        minute: USER_UPDATED_MINUTE,
      },
    })

    const res = mockRes({
      locals: {
        recommendation,
        user: {
          token: 'token',
        },
        flags: {},
        urlInfo: {
          basePath: '/recommendations/1234/',
        },
      },
    })

    const next = mockNext()

    await addMinuteController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookRecallToPpud: {
          ...recommendation.bookRecallToPpud,
          minute: USER_UPDATED_MINUTE,
        },
      },
      token: 'token',
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, expect.stringContaining('/recommendations/1234/'))

    expect(next).not.toHaveBeenCalled()
  })
})
