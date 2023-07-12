import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import victimContactSchemeController from './victimContactSchemeController'

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
    await victimContactSchemeController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'victimContactScheme' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/victimContactScheme')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          hasVictimsInContactScheme: {
            selected: 'NO',
            allOptions: [
              { value: 'YES', text: 'Yes' },
              { value: 'NO', text: 'No' },
              { value: 'NOT_APPLICABLE', text: 'Not applicable' },
            ],
          },
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await victimContactSchemeController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({ value: 'NO' })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'hasVictimsInContactScheme',
              href: '#hasVictimsInContactScheme',
              errorId: 'noVictimContactSchemeSelected',
              html: 'You must select whether there are any victims in the victim contact scheme',
            },
          ],
          hasVictimsInContactScheme: {
            text: 'You must select whether there are any victims in the victim contact scheme',
            href: '#hasVictimsInContactScheme',
            errorId: 'noVictimContactSchemeSelected',
          },
        },
        recommendation: {
          isThisAnEmergencyRecall: undefined,
        },
        token: 'token1',
      },
    })

    await victimContactSchemeController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          name: 'hasVictimsInContactScheme',
          href: '#hasVictimsInContactScheme',
          errorId: 'noVictimContactSchemeSelected',
          html: 'You must select whether there are any victims in the victim contact scheme',
        },
      ],
      hasVictimsInContactScheme: {
        text: 'You must select whether there are any victims in the victim contact scheme',
        href: '#hasVictimsInContactScheme',
        errorId: 'noVictimContactSchemeSelected',
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
        hasVictimsInContactScheme: 'YES',
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

    await victimContactSchemeController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      valuesToSave: {
        hasVictimsInContactScheme: {
          selected: 'YES',
          allOptions: [
            { value: 'YES', text: 'Yes' },
            { value: 'NO', text: 'No' },
            { value: 'NOT_APPLICABLE', text: 'Not applicable' },
          ],
        },
      },
      token: 'token1',
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/victim-liaison-officer`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with NO', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        hasVictimsInContactScheme: 'NO',
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

    await victimContactSchemeController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      valuesToSave: {
        dateVloInformed: null,
        hasVictimsInContactScheme: {
          selected: 'NO',
          allOptions: [
            { value: 'YES', text: 'Yes' },
            { value: 'NO', text: 'No' },
            { value: 'NOT_APPLICABLE', text: 'Not applicable' },
          ],
        },
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

    await victimContactSchemeController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'noVictimContactSchemeSelected',
        href: '#hasVictimsInContactScheme',
        text: 'You must select whether there are any victims in the victim contact scheme',
        name: 'hasVictimsInContactScheme',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
