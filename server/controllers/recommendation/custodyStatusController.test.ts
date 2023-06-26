import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import custodyStatusController from './custodyStatusController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  const custodyStatus = {
    selected: 'YES_PRISON',
    details: '',
    allOptions: [
      { value: 'YES_PRISON', text: 'Yes, prison custody' },
      { value: 'YES_POLICE', text: 'Yes, police custody' },
      { value: 'NO', text: 'No' },
    ],
  }

  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
      },
    })
    const next = mockNext()
    await custodyStatusController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'custodyStatus' })
    expect(res.locals.inputDisplayValues).toEqual({
      details: undefined,
      value: undefined,
    })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/custodyStatus')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          custodyStatus,
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await custodyStatusController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({
      details: '',
      value: 'YES_PRISON',
    })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'custodyStatusDetailsYesPolice',
              href: '#custodyStatusDetailsYesPolice',
              errorId: 'missingCustodyPoliceAddressDetail',
              html: 'Enter the custody address',
            },
          ],
          custodyStatusDetailsYesPolice: {
            text: 'Enter the custody address',
            href: '#custodyStatusDetailsYesPolice',
            errorId: 'missingCustodyPoliceAddressDetail',
          },
        },
        recommendation: {
          custodyStatus,
        },
        token: 'token1',
      },
    })

    await custodyStatusController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      custodyStatusDetailsYesPolice: {
        errorId: 'missingCustodyPoliceAddressDetail',
        href: '#custodyStatusDetailsYesPolice',
        text: 'Enter the custody address',
      },
      list: [
        {
          href: '#custodyStatusDetailsYesPolice',
          errorId: 'missingCustodyPoliceAddressDetail',
          html: 'Enter the custody address',
          name: 'custodyStatusDetailsYesPolice',
        },
      ],
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
        custodyStatus: 'YES_POLICE',
        custodyStatusDetailsYesPolice: 'test',
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

    await custodyStatusController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        custodyStatus: {
          selected: 'YES_POLICE',
          details: 'test',
          allOptions: [
            { value: 'YES_PRISON', text: 'Yes, prison custody' },
            { value: 'YES_POLICE', text: 'Yes, police custody' },
            { value: 'NO', text: 'No' },
          ],
        },
        hasArrestIssues: null,
        localPoliceContact: null,
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        custodyStatus: 'YES_POLICE',
        custodyStatusDetailsYesPolice: '',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await custodyStatusController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingCustodyPoliceAddressDetail',
        href: '#custodyStatusDetailsYesPolice',
        invalidParts: undefined,
        name: 'custodyStatusDetailsYesPolice',
        text: 'Enter the custody address',
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
