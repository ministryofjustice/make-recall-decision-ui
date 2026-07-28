import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getCaseSummary, updateRecommendation } from '../../data/makeDecisionApiClient'
import checkMappaInformationController from './checkMappaInformationController'
import { MappaGenerator } from '../../../data/common/mappaGenerator'
import ppPaths from '../../routes/paths/pp.paths'
import { sharedPaths } from '../../routes/paths/shared.paths'

jest.mock('../../data/makeDecisionApiClient')

const mockMappaData = MappaGenerator.generate()

describe('get', () => {
  it('loads the page correctly', async () => {
    const res = mockRes({
      locals: {
        recommendation: { id: '123' },
      },
    })

    ;(getCaseSummary as jest.Mock).mockResolvedValue({
      mappa: mockMappaData,
    })

    const next = mockNext()
    await checkMappaInformationController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({
      id: 'checkMappaInformation',
    })
    expect(res.locals.mappaData).toEqual(mockMappaData)
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('updates the mappa information', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValueOnce({})

    const res = mockRes({
      token: 'token',
    })

    const req = mockReq({
      params: { recommendationId: '1' },
      body: {
        isMappaCategory4: true,
        isMappaLevel2Or3: true,
      },
    })
    const next = mockNext()

    await checkMappaInformationController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: {},
      recommendationId: '1',
      token: 'token',
      valuesToSave: {
        isMappaCategory4: true,
        isMappaLevel2Or3: true,
      },
    })
  })

  describe('with ftr56SentenceConviction flag', () => {
    it('it redirects correctly when disabled', async () => {
      ;(updateRecommendation as jest.Mock).mockResolvedValueOnce({})

      const res = mockRes({
        token: 'token',
      })

      const req = mockReq({
        params: { recommendationId: '1' },
        body: {
          isMappaCategory4: true,
          isMappaLevel2Or3: true,
        },
      })
      const next = mockNext()

      await checkMappaInformationController.post(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(
        303,
        `${sharedPaths.recommendations}/1/${ppPaths.suitabilityForFixedTermRecall}`,
      )
    })

    it('it redirects correctly when enabled', async () => {
      ;(updateRecommendation as jest.Mock).mockResolvedValueOnce({})

      const res = mockRes({
        token: 'token',
        locals: {
          flags: {
            ftr56SentenceConviction: true,
          },
        },
      })

      const req = mockReq({
        params: { recommendationId: '1' },
        body: {
          isMappaCategory4: true,
          isMappaLevel2Or3: true,
        },
      })
      const next = mockNext()

      await checkMappaInformationController.post(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(303, `${sharedPaths.recommendations}/1/${ppPaths.chargedWithOffence}`)
    })
  })
})
