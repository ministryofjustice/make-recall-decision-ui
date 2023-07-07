import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import rationaleCheckController from './rationaleCheckController'

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        token: 'token1',
      },
    })
    const next = mockNext()
    await rationaleCheckController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'rationaleCheck' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/rationaleCheck')

    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('post YES', async () => {
    const basePath = `/recommendations/123/`
    const req = mockReq({
      body: {
        crn: 'X098092',
        rationaleCheck: 'YES',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await rationaleCheckController.post(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(
      303,
      `/recommendations/123/spo-task-list-consider-recall?fromPageId=rationale-check`
    )
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post NO', async () => {
    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        rationaleCheck: 'NO',
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

    await rationaleCheckController.post(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/countersigning-telephone`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        rationaleCheck: undefined,
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await rationaleCheckController.post(req, res, mockNext())

    expect(req.session.errors).toEqual([
      {
        errorId: 'missingRationaleCheck',
        href: '#rationaleCheck',
        text: 'Choose an option',
        name: 'rationaleCheck',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
