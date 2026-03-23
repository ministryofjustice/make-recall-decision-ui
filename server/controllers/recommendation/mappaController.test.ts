import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import updatePageReviewedStatus from '../recommendations/helpers/updatePageReviewedStatus'
import mappaController from './mappaController'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../recommendations/helpers/updatePageReviewedStatus')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { id: '123', personOnProbation: { name: 'Joe Bloggs' } },
      },
    })
    const next = mockNext()
    await mappaController.get(
      mockReq({
        params: { recommendationId: '123' },
      }),
      res,
      next,
    )

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: {},
      propertyToRefresh: 'mappa',
      recommendationId: '123',
      token: 'token',
    })

    expect(updatePageReviewedStatus).toHaveBeenCalledWith({
      recommendationId: '123',
      reviewedProperty: 'mappa',
      token: 'token',
    })

    expect(res.locals.page).toEqual({ id: 'mappa' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/mappa')
    expect(next).toHaveBeenCalled()
  })

  it('load with no data, with FTR56 enabled', async () => {
    const res = mockRes({
      locals: {
        recommendation: { id: '123', personOnProbation: { name: 'Joe Bloggs' } },
        flags: { flagFTR56Enabled: true },
      },
    })
    const next = mockNext()
    await mappaController.get(
      mockReq({
        params: { recommendationId: '123' },
      }),
      res,
      next,
    )

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: { flagFTR56Enabled: true },
      propertyToRefresh: 'mappa',
      recommendationId: '123',
      token: 'token',
      valuesToSave: {
        isMappaCategory4: false,
        isMappaLevel2Or3: false,
      },
    })

    expect(updatePageReviewedStatus).toHaveBeenCalledWith({
      recommendationId: '123',
      reviewedProperty: 'mappa',
      token: 'token',
    })

    expect(res.locals.page).toEqual({ id: 'mappa' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/mappa')
    expect(next).toHaveBeenCalled()
  })

  describe('updates the recommendation with the correct MAPPA properties', () => {
    ;[
      {
        mappaData: {
          category: 0,
          mappaLevel: 1,
        },
        expected: {
          isMappaCategory4: false,
          isMappaLevel2Or3: false,
        },
      },
      {
        mappaData: {
          category: 1,
          mappaLevel: 2,
        },
        expected: {
          isMappaCategory4: false,
          isMappaLevel2Or3: true,
        },
      },
      {
        mappaData: {
          category: 2,
          mappaLevel: 3,
        },
        expected: {
          isMappaCategory4: false,
          isMappaLevel2Or3: true,
        },
      },
      {
        mappaData: {
          category: 4,
          mappaLevel: 3,
        },
        expected: {
          isMappaCategory4: true,
          isMappaLevel2Or3: true,
        },
      },
      {
        mappaData: {
          category: 4,
          mappaLevel: 1,
        },
        expected: {
          isMappaCategory4: true,
          isMappaLevel2Or3: false,
        },
      },
    ].forEach(testCase => {
      it(`gets the correct values when MAPPA category is: ${testCase.mappaData.category} and MAPPA level is: ${testCase.mappaData.mappaLevel}`, async () => {
        const res = mockRes({
          locals: {
            recommendation: {
              id: '123',
              personOnProbation: { name: 'Joe Bloggs', mappa: { ...testCase.mappaData } },
            },
            flags: { flagFTR56Enabled: true },
          },
        })
        const next = mockNext()

        await mappaController.get(
          mockReq({
            params: { recommendationId: '123' },
          }),
          res,
          next,
        )

        expect(updateRecommendation).toHaveBeenCalledWith({
          featureFlags: { flagFTR56Enabled: true },
          valuesToSave: {
            isMappaCategory4: testCase.expected.isMappaCategory4,
            isMappaLevel2Or3: testCase.expected.isMappaLevel2Or3,
          },
          propertyToRefresh: 'mappa',
          recommendationId: '123',
          token: 'token',
        })
      })
    })
  })
})
