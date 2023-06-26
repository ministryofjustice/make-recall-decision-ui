import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import whyConsideredRecallController from './whyConsideredRecallController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {},
      },
    })
    const next = mockNext()
    await whyConsideredRecallController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'whyConsideredRecall' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/whyConsideredRecall')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          whyConsideredRecall: {
            selected: 'RISK_INCREASED',
            allOptions: [
              {
                value: 'RISK_INCREASED',
                text: 'Your risk is assessed as increased',
              },
              {
                value: 'CONTACT_STOPPED',
                text: 'Contact with your probation practitioner has broken down',
              },
              {
                value: 'RISK_INCREASED_AND_CONTACT_STOPPED',
                text: 'Your risk is assessed as increased and contact with your probation practitioner has broken down',
              },
            ],
          },
        },
      },
    })
    const next = mockNext()
    await whyConsideredRecallController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({ value: 'RISK_INCREASED' })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        unsavedValues: { recallType: 'STANDARD' },
        errors: {
          list: [
            {
              name: 'whyConsideredRecall',
              href: '#whyConsideredRecall',
              errorId: 'noWhyConsideredRecallSelected',
              html: 'Select a reason why you considered recall',
            },
          ],
          whyConsideredRecall: {
            text: 'Select a reason why you considered recall',
            href: '#whyConsideredRecall',
            errorId: 'noWhyConsideredRecallSelected',
          },
        },
      },
    })

    await whyConsideredRecallController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      whyConsideredRecall: {
        errorId: 'noWhyConsideredRecallSelected',
        href: '#whyConsideredRecall',
        text: 'Select a reason why you considered recall',
      },
      list: [
        {
          href: '#whyConsideredRecall',
          errorId: 'noWhyConsideredRecallSelected',
          html: 'Select a reason why you considered recall',
          name: 'whyConsideredRecall',
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
        whyConsideredRecall: 'RISK_INCREASED',
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

    await whyConsideredRecallController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        whyConsideredRecall: {
          selected: 'RISK_INCREASED',
          allOptions: [
            {
              value: 'RISK_INCREASED',
              text: 'Your risk is assessed as increased',
            },
            {
              value: 'CONTACT_STOPPED',
              text: 'Contact with your probation practitioner has broken down',
            },
            {
              value: 'RISK_INCREASED_AND_CONTACT_STOPPED',
              text: 'Your risk is assessed as increased and contact with your probation practitioner has broken down',
            },
          ],
        },
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/reasons-no-recall`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        whyConsideredRecall: undefined,
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await whyConsideredRecallController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'noWhyConsideredRecallSelected',
        href: '#whyConsideredRecall',
        text: 'Select a reason why you considered recall',
        name: 'whyConsideredRecall',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
