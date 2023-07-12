import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import victimLiasonOfficerController from './victimLiasonOfficerController'

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
    await victimLiasonOfficerController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'victimLiaisonOfficer' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/victimLiaisonOfficer')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          dateVloInformed: '2022-01-01',
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await victimLiasonOfficerController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({
      value: {
        day: '01',
        month: '01',
        year: '2022',
      },
    })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'dateVloInformed',
              href: '#dateVloInformed-day',
              values: [Object],
              errorId: 'blankDateTime',
              html: 'Enter the date you told the VLO',
            },
          ],
          dateVloInformed: {
            text: 'Enter the date you told the VLO',
            href: '#dateVloInformed-day',
            values: { day: '', month: '', year: '' },
            errorId: 'blankDateTime',
          },
        },
        recommendation: {
          isThisAnEmergencyRecall: undefined,
        },
        token: 'token1',
      },
    })

    await victimLiasonOfficerController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          name: 'dateVloInformed',
          href: '#dateVloInformed-day',
          values: [Object],
          errorId: 'blankDateTime',
          html: 'Enter the date you told the VLO',
        },
      ],
      dateVloInformed: {
        text: 'Enter the date you told the VLO',
        href: '#dateVloInformed-day',
        values: { day: '', month: '', year: '' },
        errorId: 'blankDateTime',
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
        'dateVloInformed-day': '01',
        'dateVloInformed-month': '01',
        'dateVloInformed-year': '2022',
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

    await victimLiasonOfficerController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      valuesToSave: {
        dateVloInformed: '2022-01-01',
      },
      token: 'token1',
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list#heading-victim-liaison`)
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

    await victimLiasonOfficerController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'blankDateTime',
        href: '#dateVloInformed-day',
        text: 'Enter the date you told the VLO',
        name: 'dateVloInformed',
        invalidParts: undefined,
        values: {
          day: undefined,
          month: undefined,
          year: undefined,
        },
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
