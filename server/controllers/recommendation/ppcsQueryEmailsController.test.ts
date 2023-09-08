import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import ppcsQueryEmailsController from './ppcsQueryEmailsController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { crn: 'X123' },
      },
    })
    const next = mockNext()
    await ppcsQueryEmailsController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'ppcsQueryEmails' })
    expect(res.locals.inputDisplayValues.ppcsQueryEmails).toEqual([''])
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/ppcsQueryEmails')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          ppcsQueryEmails: ['alpha@me.com', 'beta@me.com'],
        },
      },
    })

    await ppcsQueryEmailsController.get(mockReq(), res, mockNext())

    expect(res.locals.inputDisplayValues.ppcsQueryEmails).toEqual(['alpha@me.com', 'beta@me.com'])
  })

  it('load with unsaved data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          ppcsQueryEmails: ['alpha@me.com', 'beta@me.com'],
        },
        unsavedValues: {
          ppcsQueryEmails: ['gamma@me.com', 'epsilon@me.com'],
        },
      },
    })

    await ppcsQueryEmailsController.get(mockReq(), res, mockNext())

    expect(res.locals.inputDisplayValues.ppcsQueryEmails).toEqual(['gamma@me.com', 'epsilon@me.com'])
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: { val: 'some error' },
        recommendation: {},
        unsavedValues: {
          ppcsQueryEmails: ['gamma@here', 'epsilon@here'],
        },
      },
    })

    await ppcsQueryEmailsController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({ val: 'some error' })
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        size: '3',
        email_0: 'huey@me.com',
        email_1: 'duey@me.com',
        email_2: 'louie@me.com',
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

    await ppcsQueryEmailsController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        ppcsQueryEmails: ['huey@me.com', 'duey@me.com', 'louie@me.com'],
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list`)
    expect(next).not.toHaveBeenCalled()
  })

  it('post with empty fields', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        size: '3',
        email_0: 'huey@me.com',
        email_1: '',
        email_2: '',
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

    await ppcsQueryEmailsController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        ppcsQueryEmails: ['huey@me.com'],
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list`)
    expect(next).not.toHaveBeenCalled()
  })

  it('post with no email supplied', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        size: '1',
        email_0: '',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await ppcsQueryEmailsController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingPPCSEmail',
        href: '#email',
        text: 'Enter an email address',
        name: 'email',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })

  it('post with invalid email supplied', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        size: '1',
        email_0: 'test@here',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await ppcsQueryEmailsController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'invalidPPCSEmail',
        href: '#email_0',
        text: 'Enter an email address in the correct format, like name@example.com',
        name: 'email_0',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })

  it('post with add', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        size: '1',
        email_0: 'gadget@me.com',
        add: '',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await ppcsQueryEmailsController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.unsavedValues).toEqual({
      ppcsQueryEmails: ['gadget@me.com', ''],
    })
    expect(req.session.errors).not.toBeDefined()
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })

  it('post with remove', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        size: '2',
        email_0: 'gadget@me.com',
        email_1: 'huey@me.com',
        remove_1: '',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await ppcsQueryEmailsController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.unsavedValues).toEqual({
      ppcsQueryEmails: ['gadget@me.com'],
    })
    expect(req.session.errors).not.toBeDefined()
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
