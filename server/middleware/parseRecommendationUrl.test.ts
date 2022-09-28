import { Response, NextFunction } from 'express'
import { parseRecommendationUrl } from './parseRecommendationUrl'
import { mockReq, mockRes } from './testutils/mockRequestUtils'

describe('parseRecommendationUrl', () => {
  let res: Response
  let next: NextFunction

  const recommendationId = '123'
  const currentPageId = 'recall-type'
  const path = `/recommendations/${recommendationId}/${currentPageId}`
  const defaultRequest = {
    path,
    params: { recommendationId, pageUrlSlug: currentPageId },
  }

  beforeEach(() => {
    res = mockRes()
    next = jest.fn()
  })

  it('saves base path and currentPageId to urlInfo object', () => {
    const req = mockReq(defaultRequest)
    parseRecommendationUrl(req, res, next)
    expect(res.locals.urlInfo).toEqual({
      basePath: `/recommendations/${recommendationId}/`,
      currentPageId,
    })
  })

  it('saves from page and anchor to urlInfo object', () => {
    const fromPageId = 'task-list'
    const fromAnchor = 'heading-recommendation'
    const req = mockReq({
      ...defaultRequest,
      query: { fromPageId, fromAnchor },
    })
    parseRecommendationUrl(req, res, next)
    expect(res.locals.urlInfo).toEqual({
      basePath: `/recommendations/${recommendationId}/`,
      currentPageId,
      fromPageId,
      fromAnchor,
    })
  })

  it('allows fromPageId to be no recall task list', () => {
    const fromPageId = 'task-list-no-recall'
    const fromAnchor = 'heading-circumstances'
    const req = mockReq({
      ...defaultRequest,
      query: { fromPageId, fromAnchor },
    })
    parseRecommendationUrl(req, res, next)
    expect(res.locals.urlInfo).toEqual({
      basePath: `/recommendations/${recommendationId}/`,
      currentPageId,
      fromPageId,
      fromAnchor,
    })
  })

  it("doesn't include fromPageId if it is invalid", () => {
    const fromPageId = 'banana'
    const req = mockReq({
      ...defaultRequest,
      query: { fromPageId },
    })
    parseRecommendationUrl(req, res, next)
    expect(res.locals.urlInfo).toEqual({
      basePath: `/recommendations/${recommendationId}/`,
      currentPageId,
    })
  })
})
