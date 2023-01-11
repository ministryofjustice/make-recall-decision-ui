import { nextPageLinkUrl, changeLinkUrl, checkForRedirectPath } from './urls'
import { RecallTypeSelectedValue } from '../../../@types/make-recall-decision-api/models/RecallTypeSelectedValue'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { ManagerRecallDecisionTypeSelectedValue } from '../../../@types/make-recall-decision-api/models/ManagerRecallDecisionTypeSelectedValue'

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

    it('returns case overview if task list is requested by SPO', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'task-list',
        recommendation: { recallType: { selected: { value: RecallTypeSelectedValue.value.FIXED_TERM } } },
        basePathRecFlow: basePath,
        crn,
        featureFlags: {},
        hasSpoRole: true,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toEqual(`/cases/${crn}/overview`)
    })
  })

  describe('Record manager decision', () => {
    it('returns null if "Record manager decision" is requested by SPO but decision not sent to Delius', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'manager-record-decision',
        recommendation: {
          managerRecallDecision: {
            selected: {
              value: ManagerRecallDecisionTypeSelectedValue.value.RECALL,
            },
          },
        },
        basePathRecFlow: basePath,
        crn,
        featureFlags: { flagConsiderRecall: true },
        hasSpoRole: true,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toBeNull()
    })

    it('returns case overview if "Record manager decision" is requested by PO', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'manager-record-decision',
        recommendation: {
          managerRecallDecision: {
            selected: {
              value: ManagerRecallDecisionTypeSelectedValue.value.RECALL,
            },
          },
        },
        basePathRecFlow: basePath,
        crn,
        featureFlags: { flagConsiderRecall: true },
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toEqual(`/cases/${crn}/overview`)
    })

    it('returns case overview if "Record manager decision in Delius" is requested by PO', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'manager-record-decision-delius',
        recommendation: {
          managerRecallDecision: {
            selected: {
              value: ManagerRecallDecisionTypeSelectedValue.value.RECALL,
            },
          },
        },
        basePathRecFlow: basePath,
        crn,
        featureFlags: { flagConsiderRecall: true },
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toEqual(`/cases/${crn}/overview`)
    })

    it('returns case overview if "View decision" is requested by PO', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'manager-view-decision',
        recommendation: {
          managerRecallDecision: {
            selected: {
              value: ManagerRecallDecisionTypeSelectedValue.value.RECALL,
            },
          },
        },
        basePathRecFlow: basePath,
        crn,
        featureFlags: { flagConsiderRecall: true },
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toEqual(`/cases/${crn}/overview`)
    })

    it('returns "View decision" if "Record your decision" is requested and decision has been sent to Delius', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'manager-record-decision',
        recommendation: {
          managerRecallDecision: {
            isSentToDelius: true,
          },
        },
        basePathRecFlow: basePath,
        crn,
        featureFlags: { flagConsiderRecall: true },
        hasSpoRole: true,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toEqual(`${basePath}manager-view-decision`)
    })

    it('returns "Review with a manager" if a page after that is requested by PO and decision has not been sent to Delius', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'recall-type',
        recommendation: {},
        basePathRecFlow: basePath,
        crn,
        featureFlags: {},
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toEqual(`${basePath}stop-think`)
    })

    it('returns null if a page before "Review with a manager" is requested by PO and decision has not been sent to Delius', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'alternatives-tried',
        recommendation: {},
        basePathRecFlow: basePath,
        crn,
        featureFlags: { flagConsiderRecall: true },
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toBeNull()
    })

    it('returns null if "Review with a manager" is requested by PO and decision has not been sent to Delius', () => {
      const pageUrlSlug = checkForRedirectPath({
        requestedPageId: 'stop-think',
        recommendation: {},
        basePathRecFlow: basePath,
        crn,
        featureFlags: { flagConsiderRecall: true },
        hasSpoRole: false,
        recommendationStatus: RecommendationResponse.status.DRAFT,
      })
      expect(pageUrlSlug).toBeNull()
    })
  })
})
