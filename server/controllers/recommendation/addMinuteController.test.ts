import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import addMinuteController from './addMinuteController'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'
import CUSTODY_GROUP from '../../@types/make-recall-decision-api/models/ppud/CustodyGroup'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('loads the saved minute when one exists', async () => {
    const recommendation = {
      crn: 'X1213',
      bookRecallToPpud: {
        minute: 'some text',
      },
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })

    const req = mockReq()
    const next = mockNext()

    await addMinuteController.get(req, res, next)

    expect(res.locals.page).toEqual({ id: 'addMinute' })
    expect(res.locals.minute).toEqual('some text')
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/addMinute')
    expect(next).toHaveBeenCalled()
  })

  it('generates the default minute when no minute has been saved', async () => {
    const recommendation = {
      ...recommendationApiResponse,
      bookRecallToPpud: {},
      sentenceGroup: SentenceGroup.EXTENDED,
      currentRoshForPartA: recommendationApiResponse.currentRoshForPartA,
      prisonOffender: {
        status: 'ACTIVE IN',
        locationDescription: 'HMP Test Prison',
      },
      nomisIndexOffence: {
        selected: '123',
        allOptions: [
          {
            offenderChargeId: '123',
            courtDescription: 'Crown Court',
          },
        ],
      },
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })

    const req = mockReq()
    const next = mockNext()

    await addMinuteController.get(req, res, next)

    expect(res.locals.page).toEqual({ id: 'addMinute' })
    expect(res.locals.minute).toContain('Background information')
    expect(res.locals.minute).toContain('All mandatory documents received')
    expect(res.locals.minute).toContain('Extended sentence: Yes')
    expect(res.locals.minute).toContain(`Risk of serious harm level: Very High`)
    expect(res.locals.minute).toContain('In custody: Yes (at HMP Test Prison)')
    expect(res.locals.minute).toContain('Sentencing court: Crown Court')
    expect(res.locals.minute).toContain('More information')
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/addMinute')
    expect(next).toHaveBeenCalled()
  })

  it('uses the default prison location when locationDescription is missing', async () => {
    const recommendation = {
      ...recommendationApiResponse,
      bookRecallToPpud: {},
      prisonOffender: {
        status: 'ACTIVE IN',
        locationDescription: '',
      },
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })

    const req = mockReq()
    const next = mockNext()

    await addMinuteController.get(req, res, next)

    expect(res.locals.minute).toContain('In custody: Yes (at HMP Prison)')
  })

  it('sets custody to No when the offender is not active in custody', async () => {
    const recommendation = {
      ...recommendationApiResponse,
      bookRecallToPpud: {},
      prisonOffender: {
        status: 'ACTIVE OUT',
        locationDescription: 'HMP Test Prison',
      },
    }

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
  })

  it('saves the minute and redirects to the next page', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      id: 1,
      bookRecallToPpud: {
        policeForce: 'Kent',
        custodyGroup: CUSTODY_GROUP.DETERMINATE,
      },
    })
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

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
        user: {
          token: 'token1',
        },
        flags: {},
        urlInfo: {
          basePath: '/recommendations/1234/',
        },
      },
    })

    const next = mockNext()

    await addMinuteController.post(req, res, next)

    expect(getRecommendation).toHaveBeenCalledWith('1234', 'token')

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookRecallToPpud: {
          policeForce: 'Kent',
          custodyGroup: CUSTODY_GROUP.DETERMINATE,
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
