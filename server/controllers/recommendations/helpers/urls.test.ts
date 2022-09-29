import { nextPageLinkUrl, changeLinkUrl, validateUpdateRecommendationPageRequest } from './urls'
import { RecallTypeSelectedValue } from '../../../@types/make-recall-decision-api'

describe('nextPageLinkUrl', () => {
  it('returns a url back to the "from" page, if supplied', () => {
    const urlInfo = {
      fromPageId: 'task-list',
      fromAnchor: 'heading-recommendation',
      basePath: '/recommendations/123/',
      path: '/recommendations/123/recall-type',
    }
    expect(nextPageLinkUrl({ nextPageId: 'stop-think', urlInfo })).toEqual(
      '/recommendations/123/task-list#heading-recommendation'
    )
  })

  it("doesn't use an anchor, if not supplied", () => {
    const urlInfo = {
      fromPageId: 'task-list',
      basePath: '/recommendations/123/',
      path: '/recommendations/123/recall-type',
    }
    expect(nextPageLinkUrl({ nextPageId: 'stop-think', urlInfo })).toEqual('/recommendations/123/task-list')
  })

  it('returns a url using the nextPageId, if a "from" page is not supplied', () => {
    const urlInfo = {
      basePath: '/recommendations/123/',
      path: '/recommendations/123/recall-type',
    }
    expect(nextPageLinkUrl({ nextPageId: 'stop-think', urlInfo })).toEqual('/recommendations/123/stop-think')
  })

  it('returns a url using the nextPagePath, if a "from" page is not supplied', () => {
    const urlInfo = {
      basePath: '/recommendations/123/',
      path: '/recommendations/123/recall-type',
    }
    expect(nextPageLinkUrl({ nextPagePath: '/cases/123/overview', urlInfo })).toEqual('/cases/123/overview')
  })
})

describe('changeLinkUrl', () => {
  it('returns a url back to the "from" page, if supplied', () => {
    const urlInfo = {
      currentPageId: 'task-list',
      basePath: '/recommendations/123/',
      path: '/recommendations/123/recall-type',
    }
    const url = changeLinkUrl({ pageUrlSlug: 'recall-type', urlInfo, fromAnchor: 'heading-recommendation' })
    expect(url).toEqual('/recommendations/123/recall-type?fromPageId=task-list&fromAnchor=heading-recommendation')
  })
})

describe('validateUpdateRecommendationPageRequest', () => {
  it('returns null if neither task list was requested', () => {
    const pageUrlSlug = validateUpdateRecommendationPageRequest({
      requestedPageId: 'emergency-recall',
      recallType: 'FIXED_TERM' as RecallTypeSelectedValue.value,
    })
    expect(pageUrlSlug).toBeNull()
  })

  it('returns null if recall task list requested for standard recall', () => {
    const pageUrlSlug = validateUpdateRecommendationPageRequest({
      requestedPageId: 'task-list',
      recallType: 'STANDARD' as RecallTypeSelectedValue.value,
    })
    expect(pageUrlSlug).toBeNull()
  })

  it('returns null if recall task list requested for fixed term recall', () => {
    const pageUrlSlug = validateUpdateRecommendationPageRequest({
      requestedPageId: 'task-list',
      recallType: 'FIXED_TERM' as RecallTypeSelectedValue.value,
    })
    expect(pageUrlSlug).toBeNull()
  })

  it('returns null if no recall task list requested for no recall', () => {
    const pageUrlSlug = validateUpdateRecommendationPageRequest({
      requestedPageId: 'task-list-no-recall',
      recallType: 'NO_RECALL' as RecallTypeSelectedValue.value,
    })
    expect(pageUrlSlug).toBeNull()
  })

  it('returns no recall task list if recall task list requested for no recall', () => {
    const pageUrlSlug = validateUpdateRecommendationPageRequest({
      requestedPageId: 'task-list',
      recallType: 'NO_RECALL' as RecallTypeSelectedValue.value,
    })
    expect(pageUrlSlug).toEqual('task-list-no-recall')
  })

  it('returns recall task list if no recall task list requested for standard recall', () => {
    const pageUrlSlug = validateUpdateRecommendationPageRequest({
      requestedPageId: 'task-list-no-recall',
      recallType: 'STANDARD' as RecallTypeSelectedValue.value,
    })
    expect(pageUrlSlug).toEqual('task-list')
  })

  it('returns recall task list if no recall task list requested for fixed term recall', () => {
    const pageUrlSlug = validateUpdateRecommendationPageRequest({
      requestedPageId: 'task-list-no-recall',
      recallType: 'FIXED_TERM' as RecallTypeSelectedValue.value,
    })
    expect(pageUrlSlug).toEqual('task-list')
  })

  it('returns response to probation if recall task list requested and recall not set', () => {
    const pageUrlSlug = validateUpdateRecommendationPageRequest({ requestedPageId: 'task-list', recallType: undefined })
    expect(pageUrlSlug).toEqual('response-to-probation')
  })

  it('returns response to probation if no recall task list requested and recall not set', () => {
    const pageUrlSlug = validateUpdateRecommendationPageRequest({
      requestedPageId: 'task-list-no-recall',
      recallType: undefined,
    })
    expect(pageUrlSlug).toEqual('response-to-probation')
  })
})
