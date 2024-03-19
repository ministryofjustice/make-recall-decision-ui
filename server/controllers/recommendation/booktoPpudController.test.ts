import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import bookToPpudController from './bookToPpudController'
import bookOffender from '../../booking/bookOffender'
import createOrUpdateSentence from '../../booking/createOrUpdateSentence'
import updateOffence from '../../booking/updateOffence'
import updateRelease from '../../booking/updateRelease'
import updateRecall from '../../booking/updateRecall'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { StageEnum } from '../../booking/StageEnum'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../../booking/bookOffender')
jest.mock('../../booking/updateRecall')
jest.mock('../../booking/updateRelease')
jest.mock('../../booking/createOrUpdateSentence')
jest.mock('../../booking/updateOffence')
jest.mock('../../monitoring/azureAppInsights')

describe('get', () => {
  it('load', async () => {
    const recommendation = {
      crn: 'X1213',
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()
    await bookToPpudController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'bookToPpud' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/bookToPpud')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('post - happy path', async () => {
    const recommendation = { id: '12345' }
    const flags = { xyz: true }

    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)

    const basePath = `/recommendations/1/`
    const req = mockReq({
      params: { recommendationId: '1' },
    })

    const res = mockRes({
      locals: {
        urlInfo: { basePath },
        flags,
      },
    })
    const next = mockNext()

    ;(bookOffender as jest.Mock).mockResolvedValue({ stage: StageEnum.OFFENDER_BOOKED })
    ;(createOrUpdateSentence as jest.Mock).mockResolvedValue({ stage: StageEnum.SENTENCE_BOOKED })
    ;(updateOffence as jest.Mock).mockResolvedValue({ stage: StageEnum.OFFENCE_BOOKED })
    ;(updateRelease as jest.Mock).mockResolvedValue({ stage: StageEnum.RELEASE_BOOKED })
    ;(updateRecall as jest.Mock).mockResolvedValue({ stage: StageEnum.RECALL_BOOKED })

    await bookToPpudController.post(req, res, next)

    expect(updateStatuses).toHaveBeenCalledWith({
      activate: ['BOOKING_ON_STARTED'],
      deActivate: [],
      recommendationId: '1',
      token: 'token',
    })

    expect(bookOffender).toHaveBeenCalledWith({ stage: StageEnum.STARTED }, recommendation, 'token', flags)
    expect(createOrUpdateSentence).toHaveBeenCalledWith(
      { stage: StageEnum.OFFENDER_BOOKED },
      recommendation,
      'token',
      flags
    )
    expect(updateOffence).toHaveBeenCalledWith({ stage: StageEnum.SENTENCE_BOOKED }, recommendation, 'token', flags)
    expect(updateRelease).toHaveBeenCalledWith({ stage: StageEnum.OFFENCE_BOOKED }, recommendation, 'token', flags)
    expect(updateRecall).toHaveBeenCalledWith({ stage: StageEnum.RELEASE_BOOKED }, recommendation, 'token', flags)

    expect(updateStatuses).toHaveBeenCalledWith({
      activate: ['BOOKED_TO_PPUD', 'REC_CLOSED'],
      deActivate: [],
      recommendationId: '1',
      token: 'token',
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/booked-to-ppud`)
    expect(next).not.toHaveBeenCalled()
  })

  it('post - exception', async () => {
    const recommendation = { id: '12345', crn: 'X123' }
    const flags = { xyz: true }

    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)

    const basePath = `/recommendations/1/`
    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '1' },
    })

    const res = mockRes({
      locals: {
        urlInfo: { basePath },
        flags,
        user: {
          username: 'Dave',
          token: 'token1',
          region: { code: 'N07', name: 'London' },
        },
      },
    })
    const next = mockNext()

    ;(bookOffender as jest.Mock).mockImplementation(() => {
      throw new PpudError(400, JSON.stringify({ something: 'text' }))
    })

    await bookToPpudController.post(req, res, next)

    expect(bookOffender).toHaveBeenCalledWith(
      {
        stage: StageEnum.STARTED,
        failed: true,
        failedMessage: '{"something":"text"}',
      },
      recommendation,
      'token',
      flags
    )
    expect(createOrUpdateSentence).not.toHaveBeenCalled()
    expect(updateOffence).not.toHaveBeenCalled()
    expect(updateRelease).not.toHaveBeenCalled()
    expect(updateRecall).not.toHaveBeenCalled()

    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdBookingOnToPPUDError',
      'Dave',
      {
        crn: 'X123',
        recommendationId: '1',
        region: { code: 'N07', name: 'London' },
      },
      {
        xyz: true,
      }
    )

    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
    expect(next).not.toHaveBeenCalled()
  })
})

class PpudError {
  public status: number

  public text: string

  constructor(status: number, text: string) {
    this.status = status
    this.text = text
  }
}
