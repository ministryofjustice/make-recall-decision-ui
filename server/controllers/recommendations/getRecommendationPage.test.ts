import { Request, Response } from 'express'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendationPage } from './getRecommendationPage'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { getRecommendation, updateRecommendation, createDocument } from '../../data/makeDecisionApiClient'
import { fetchAndTransformLicenceConditions } from './licenceConditions/transform'
import { AuditService } from '../../services/auditService'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('./licenceConditions/transform')

const accessToken = 'abc'
const recommendationId = '123'
let req: Request
let res: Response

describe('getRecommendationPage', () => {
  beforeEach(() => {
    req = mockReq({ params: { recommendationId, pageUrlSlug: 'custody-status' } })
    res = mockRes({ token: accessToken, locals: { user: { username: 'Bill' } } })
  })

  it('should fetch data and render a recommendation page', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    await getRecommendationPage(req, res)
    expect(res.locals.recommendation).toEqual({ ...recommendationApiResponse, isInCustody: true })
    expect(res.locals.page).toEqual({ id: 'custodyStatus' })
    expect(res.locals.pageHeadings.custodyStatus).toEqual('Is Paula Smith in custody now?')
    expect(res.locals.pageTitles.custodyStatus).toEqual('Is the person in custody now?')
    expect(res.locals.inputDisplayValues.value).toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/custodyStatus')
  })

  it('should send a parameter to the UPDATE recommendation endpoint if the page needs data refreshed', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(fetchAndTransformLicenceConditions as jest.Mock).mockResolvedValue({})
    req = mockReq({ params: { recommendationId, pageUrlSlug: 'previous-releases' } })
    await getRecommendationPage(req, res)
    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'abc',
      propertyToRefresh: 'previousReleases',
      featureFlags: {},
    })
  })

  it('should fetch licence conditions if on that page', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(fetchAndTransformLicenceConditions as jest.Mock).mockResolvedValue({})
    req = mockReq({ params: { recommendationId, pageUrlSlug: 'licence-conditions' } })
    await getRecommendationPage(req, res)
    expect(fetchAndTransformLicenceConditions).toHaveBeenCalledWith({ crn: 'X12345', token: 'abc' })
  })

  it('should fetch no recall preview letter if on that page', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(createDocument as jest.Mock).mockResolvedValue({})
    req = mockReq({ params: { recommendationId, pageUrlSlug: 'preview-no-recall' } })
    await getRecommendationPage(req, res)
    expect(createDocument).toHaveBeenCalledWith('123', 'no-recall-letter', { format: 'preview' }, 'abc')
  })

  it('should prevent page caching', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    await getRecommendationPage(req, res)
    expect(res.set).toHaveBeenCalledWith({ 'Cache-Control': 'no-store' })
  })

  it('should throw on an API error', async () => {
    const thrownErr = new Error('test')
    ;(getRecommendation as jest.Mock).mockRejectedValue(thrownErr)
    try {
      await getRecommendationPage(req, res)
    } catch (err) {
      expect(err).toEqual(thrownErr)
    }
  })

  it('should send an audit event', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    jest.spyOn(AuditService.prototype, 'recommendationView')
    await getRecommendationPage(req, res)
    expect(AuditService.prototype.recommendationView).toHaveBeenCalledWith({
      crn: 'X12345',
      recommendationId,
      pageUrlSlug: 'custody-status',
      username: 'Bill',
      logErrors: false,
    })
  })

  it('should redirect to case overview if the recommendation status is DOCUMENT_DOWNLOADED', async () => {
    const crn = 'X12345'
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      crn,
      status: 'DOCUMENT_DOWNLOADED',
    })
    await getRecommendationPage(req, res)
    expect(res.redirect).toHaveBeenCalledWith(301, `/cases/${crn}/overview`)
  })
})
