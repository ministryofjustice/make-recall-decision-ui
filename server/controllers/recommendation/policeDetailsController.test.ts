import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import policeDetailsController from './policeDetailsController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {},
        token: 'token1',
      },
    })
    const next = mockNext()
    await policeDetailsController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'localPoliceContactDetails' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/localPoliceContactDetails')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          localPoliceContact: {
            contactName: 'Danny Smokes',
            phoneNumber: '07881975777',
            faxNumber: '',
            emailAddress: 'smokes@me.com',
          },
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await policeDetailsController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({
      contactName: 'Danny Smokes',
      phoneNumber: '07881975777',
      faxNumber: '',
      emailAddress: 'smokes@me.com',
    })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'contactName',
              href: '#contactName',
              errorId: 'noLocalPoliceName',
              html: 'Enter the police contact name',
            },
          ],
          contactName: {
            text: 'Enter the police contact name',
            href: '#contactName',
            errorId: 'noLocalPoliceName',
          },
        },
        recommendation: {
          isThisAnEmergencyRecall: undefined,
        },
        token: 'token1',
      },
    })

    await policeDetailsController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          name: 'contactName',
          href: '#contactName',
          errorId: 'noLocalPoliceName',
          html: 'Enter the police contact name',
        },
      ],
      contactName: {
        text: 'Enter the police contact name',
        href: '#contactName',
        errorId: 'noLocalPoliceName',
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
        contactName: 'Danny Smokes',
        phoneNumber: '07881975777',
        faxNumber: '',
        emailAddress: 'smokes@me.com',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: {},
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await policeDetailsController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      valuesToSave: {
        localPoliceContact: {
          contactName: 'Danny Smokes',
          phoneNumber: '07881975777',
          faxNumber: '',
          emailAddress: 'smokes@me.com',
        },
      },
      token: 'token1',
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list#heading-custody`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {},
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await policeDetailsController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'noLocalPoliceName',
        href: '#contactName',
        text: 'Enter the police contact name',
        name: 'contactName',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
