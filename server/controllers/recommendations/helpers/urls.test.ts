import { changeLinkUrl, checkForRedirectPath, nextPageLinkUrl } from './urls'
import { RecallTypeSelectedValue } from '../../../@types/make-recall-decision-api/models/RecallTypeSelectedValue'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'

describe('nextPageLinkUrl', () => {
  it('returns a url back to the "from" page, if supplied', () => {
    const urlInfo = {
      fromPageId: 'task-list',
      fromAnchor: 'heading-recommendation',
      basePath: '/recommendations/123/',
      path: '/recommendations/123/recall-type',
    }
    expect(nextPageLinkUrl({ nextPageId: 'manager-review', urlInfo })).toEqual(
      '/recommendations/123/task-list#heading-recommendation'
    )
  })

  it("doesn't use an anchor, if not supplied", () => {
    const urlInfo = {
      fromPageId: 'task-list',
      basePath: '/recommendations/123/',
      path: '/recommendations/123/recall-type',
    }
    expect(nextPageLinkUrl({ nextPageId: 'manager-review', urlInfo })).toEqual('/recommendations/123/task-list')
  })

  it('returns a url using the nextPageId, if a "from" page is not supplied', () => {
    const urlInfo = {
      basePath: '/recommendations/123/',
      path: '/recommendations/123/recall-type',
    }
    expect(nextPageLinkUrl({ nextPageId: 'manager-review', urlInfo })).toEqual('/recommendations/123/manager-review')
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

describe('checkForRedirectPath', () => {
  const basePath = '/recommendations/123/'
  const crn = 'X514364'

  describe('Task lists', () => {
    it('returns null if neither task list was requested', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'emergency-recall',
        recommendation: {
          recallType: {
            selected: { value: RecallTypeSelectedValue.value.FIXED_TERM },
          },
          managerRecallDecision: {
            isSentToDelius: true,
          },
        },
        basePathRecFlow: basePath,
        crn,
        featureFlags: {},
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toBeNull()
    })

    it('returns null if recall task list requested for standard recall', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'task-list',
        recommendation: {
          recallType: { selected: { value: RecallTypeSelectedValue.value.STANDARD } },
          managerRecallDecision: {
            isSentToDelius: true,
          },
        },
        basePathRecFlow: basePath,
        crn,
        featureFlags: {},
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toBeNull()
    })

    it('returns null if recall task list requested for fixed term recall', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'task-list',
        recommendation: {
          recallType: { selected: { value: RecallTypeSelectedValue.value.FIXED_TERM } },
          managerRecallDecision: {
            isSentToDelius: true,
          },
        },
        basePathRecFlow: basePath,
        crn,
        featureFlags: {},
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toBeNull()
    })

    it('returns null if no recall task list requested for no recall', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'task-list-no-recall',
        recommendation: {
          recallType: { selected: { value: RecallTypeSelectedValue.value.NO_RECALL } },
          managerRecallDecision: {
            isSentToDelius: true,
          },
        },
        basePathRecFlow: basePath,
        crn,
        featureFlags: {},
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toBeNull()
    })

    it('returns no recall task list if recall task list requested for no recall', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'task-list',
        recommendation: {
          recallType: { selected: { value: RecallTypeSelectedValue.value.NO_RECALL } },
          managerRecallDecision: {
            isSentToDelius: true,
          },
        },
        basePathRecFlow: basePath,
        crn,
        featureFlags: {},
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toEqual(`${basePath}task-list-no-recall`)
    })

    it('returns recall task list if no recall task list requested for standard recall', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'task-list-no-recall',
        recommendation: {
          recallType: { selected: { value: RecallTypeSelectedValue.value.STANDARD } },
          managerRecallDecision: {
            isSentToDelius: true,
          },
        },
        basePathRecFlow: basePath,
        crn,
        featureFlags: {},
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toEqual(`${basePath}task-list`)
    })

    it('returns recall task list if no recall task list requested for fixed term recall', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'task-list-no-recall',
        recommendation: {
          recallType: { selected: { value: RecallTypeSelectedValue.value.FIXED_TERM } },
          managerRecallDecision: {
            isSentToDelius: true,
          },
        },
        basePathRecFlow: basePath,
        crn,
        featureFlags: {},
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toEqual(`${basePath}task-list`)
    })

    it('returns response to probation if recall task list requested and recall not set', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'task-list',
        recommendation: {
          managerRecallDecision: {
            isSentToDelius: true,
          },
        },
        basePathRecFlow: basePath,
        crn,
        featureFlags: {},
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toEqual(`${basePath}response-to-probation`)
    })

    it('returns response to probation if no recall task list requested and recall not set', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'task-list-no-recall',
        recommendation: {
          managerRecallDecision: {
            isSentToDelius: true,
          },
        },
        basePathRecFlow: basePath,
        crn,
        featureFlags: {},
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toEqual(`${basePath}response-to-probation`)
    })

    it('returns case summary overview if recommendation status is DOCUMENT_DOWNLOADED', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'task-list-no-recall',
        recommendation: {
          managerRecallDecision: {
            isSentToDelius: true,
          },
        },
        basePathRecFlow: basePath,
        crn,
        featureFlags: {},
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DOCUMENT_DOWNLOADED,
      })
      expect(pageUrlSlug).toEqual(`/cases/${crn}/overview`)
    })

    it('returns null if recommendation status is DOCUMENT_DOWNLOADED and Part A confirmation is requested', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'confirmation-part-a',
        recommendation: {
          managerRecallDecision: {
            isSentToDelius: true,
          },
        },
        basePathRecFlow: basePath,
        crn,
        featureFlags: {},
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DOCUMENT_DOWNLOADED,
      })
      expect(pageUrlSlug).toBeNull()
    })

    it('returns null if recommendation status is DOCUMENT_DOWNLOADED and letter confirmation is requested', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'confirmation-no-recall',
        recommendation: {
          managerRecallDecision: {
            isSentToDelius: true,
          },
        },
        basePathRecFlow: basePath,
        crn,
        featureFlags: {},
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DOCUMENT_DOWNLOADED,
      })
      expect(pageUrlSlug).toBeNull()
    })
  })
})
