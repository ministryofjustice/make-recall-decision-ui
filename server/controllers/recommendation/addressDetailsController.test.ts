import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import addressDetailsController from './addressDetailsController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        token: 'token1',
      },
    })
    const next = mockNext()
    await addressDetailsController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'addressDetails' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/addressDetails')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          isMainAddressWherePersonCanBeFound: {
            selected: true,
          },
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await addressDetailsController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({ value: 'YES' })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'isMainAddressWherePersonCanBeFound',
              href: '#isMainAddressWherePersonCanBeFound',
              errorId: 'noAddressConfirmationSelected',
              html: 'Select whether this is where the police can find {{ fullName }}',
            },
          ],
          isThisAnaddressDetails: {
            text: 'Select whether this is where the police can find {{ fullName }}',
            href: '#isMainAddressWherePersonCanBeFound',
            errorId: 'noAddressConfirmationSelected',
          },
        },
        recommendation: {
          isThisAnaddressDetails: undefined,
        },
        token: 'token1',
      },
    })

    await addressDetailsController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          name: 'isMainAddressWherePersonCanBeFound',
          href: '#isMainAddressWherePersonCanBeFound',
          errorId: 'noAddressConfirmationSelected',
          html: 'Select whether this is where the police can find {{ fullName }}',
        },
      ],
      isThisAnaddressDetails: {
        text: 'Select whether this is where the police can find {{ fullName }}',
        href: '#isMainAddressWherePersonCanBeFound',
        errorId: 'noAddressConfirmationSelected',
      },
    })
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        isMainAddressWherePersonCanBeFound: 'YES',
        isMainAddressWherePersonCanBeFoundDetailsNo: '',
        addressCount: '1',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await addressDetailsController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      valuesToSave: {
        isMainAddressWherePersonCanBeFound: {
          selected: true,
          details: null,
        },
      },
      token: 'token1',
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list#heading-person-details`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await addressDetailsController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'noAddressConfirmationSelected',
        href: '#isMainAddressWherePersonCanBeFound',
        text: 'Select whether this is where the police can find {{ fullName }}',
        name: 'isMainAddressWherePersonCanBeFound',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
