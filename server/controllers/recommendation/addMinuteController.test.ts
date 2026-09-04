import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import addMinuteController from './addMinuteController'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'
import CUSTODY_GROUP from '../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'
import { riskOfSeriousHarmLevel } from '../recommendations/helpers/rosh'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'

jest.mock('../../data/makeDecisionApiClient')

jest.mock('../recommendations/helpers/rosh', () => ({
  riskOfSeriousHarmLevel: jest.fn(),
}))

const riskOfSeriousHarmLevelMock = riskOfSeriousHarmLevel as jest.MockedFunction<typeof riskOfSeriousHarmLevel>

const MOCK_ROSH_LEVEL = 'High'

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

    riskOfSeriousHarmLevelMock.mockReturnValue(MOCK_ROSH_LEVEL)
  })

  it('loads the saved minute when one exists', async () => {
    const recommendation = RecommendationResponseGenerator.generate({})

    const expectedMinute = `Previous Minute updated notes`

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
    expect(res.locals.minute).toEqual(expectedMinute)
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/addMinute')
    expect(next).toHaveBeenCalled()
  })

  it('generates the default minute when no minute has been saved', async () => {
    const recommendation = getRecommendationMock(SentenceGroup.EXTENDED)

    const offence = recommendation.nomisIndexOffence.allOptions?.find(
      option => option.offenderChargeId === recommendation.nomisIndexOffence.selected,
    )

    const expectedMinute =
      `Background information\n` +
      `Extended sentence: Yes\n` +
      `Risk of serious harm level: ${MOCK_ROSH_LEVEL.toUpperCase()}\n` +
      `In custody: Yes (at HMP Glasgow Prison)\n` +
      `Sentencing court: ${offence?.courtDescription || ''}\n\n` +
      `More information\n`

    const res = mockRes({
      locals: {
        recommendation,
      },
    })

    const req = mockReq()
    const next = mockNext()

    await addMinuteController.get(req, res, next)

    expect(res.locals.page).toEqual({ id: 'addMinute' })
    expect(res.locals.minute).toEqual(expectedMinute)
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/addMinute')
    expect(next).toHaveBeenCalled()

    expect(riskOfSeriousHarmLevelMock).toHaveBeenCalledWith(recommendation.currentRoshForPartA)
  })

  it('displays No for non-extended sentence', async () => {
    const recommendation = getRecommendationMock(SentenceGroup.INDETERMINATE)

    const offence = recommendation.nomisIndexOffence.allOptions?.find(
      option => option.offenderChargeId === recommendation.nomisIndexOffence.selected,
    )

    const expectedMinute =
      `Background information\n` +
      `Extended sentence: No\n` +
      `Risk of serious harm level: ${MOCK_ROSH_LEVEL.toUpperCase()}\n` +
      `In custody: Yes (at HMP Glasgow Prison)\n` +
      `Sentencing court: ${offence?.courtDescription || ''}\n\n` +
      `More information\n`

    const res = mockRes({
      locals: {
        recommendation,
      },
    })

    const req = mockReq()
    const next = mockNext()

    await addMinuteController.get(req, res, next)

    expect(res.locals.minute).toEqual(expectedMinute)
  })

  it('uses the default prison location when locationDescription is missing', async () => {
    const recommendation = RecommendationResponseGenerator.generate({
      bookRecallToPpud: {},
      prisonOffender: {
        status: 'ACTIVE IN',
        locationDescription: '',
      },
    })

    const res = mockRes({
      locals: {
        recommendation,
      },
    })

    const req = mockReq()
    const next = mockNext()

    await addMinuteController.get(req, res, next)

    expect(res.locals.minute).toContain('In custody: Yes')
  })

  it('sets custody to No when the offender is not active in custody', async () => {
    const recommendation = RecommendationResponseGenerator.generate({
      bookRecallToPpud: {},
      prisonOffender: {
        status: 'ACTIVE OUT',
        locationDescription: 'HMP Test Prison',
      },
    })

    const res = mockRes({
      locals: {
        recommendation,
      },
    })

    const req = mockReq()
    const next = mockNext()

    await addMinuteController.get(req, res, next)

    expect(res.locals.minute).toContain('In custody: No')
  })
})

describe('post', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    riskOfSeriousHarmLevelMock.mockReturnValue(MOCK_ROSH_LEVEL)
  })

  it('saves the minute and redirects to the next page', async () => {
    const recommendation = RecommendationResponseGenerator.generate({
      id: 1,
      bookRecallToPpud: {
        policeForce: 'Kent',
        custodyGroup: CUSTODY_GROUP.DETERMINATE,
      },
    })

    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendation)

    const req = mockReq({
      params: {
        recommendationId: '1234',
      },
      body: {
        minute: 'some text',
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
          minute: 'some text',
        },
      },
      token: 'token',
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, expect.stringContaining('/recommendations/1234/'))

    expect(next).not.toHaveBeenCalled()
  })
})
