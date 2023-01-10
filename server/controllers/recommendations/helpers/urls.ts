import { UrlInfo } from '../../../@types'
import { RecallTypeSelectedValue } from '../../../@types/make-recall-decision-api/models/RecallTypeSelectedValue'
import { isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { routeUrls } from '../../../routes/routeUrls'

export const nextPageLinkUrl = ({
  nextPageId,
  nextPagePath,
  urlInfo,
}: {
  nextPageId?: string
  nextPagePath?: string
  urlInfo: UrlInfo
}) => {
  // if we came from a page other than the adjacent one in the sequence (eg task list), return to that instead
  const fromPageUrl = makeUrlForFromPage({ urlInfo })
  if (fromPageUrl) {
    return fromPageUrl
  }
  return nextPagePath || `${urlInfo.basePath}${nextPageId}`
}

export const makeUrlForFromPage = ({ urlInfo }: { urlInfo: UrlInfo }) => {
  const { fromPageId, fromAnchor, basePath } = urlInfo
  if (fromPageId) {
    return `${basePath}${fromPageId}${fromAnchor ? `#${fromAnchor}` : ''}`
  }
  return null
}

export const changeLinkUrl = ({
  pageUrlSlug,
  urlInfo,
  fromAnchor,
}: {
  pageUrlSlug: string
  urlInfo: UrlInfo
  fromAnchor?: string
}) => {
  const { currentPageId, basePath } = urlInfo
  const queryParam = `?fromPageId=${currentPageId}${fromAnchor ? `&fromAnchor=${fromAnchor}` : ''}`
  return `${basePath}${pageUrlSlug}${queryParam}`
}

export const checkForRedirectPath = ({
  requestedPageId,
  recommendation,
  basePathRecFlow,
  recommendationStatus,
  crn,
  hasSpoRole,
}: {
  requestedPageId: string
  recommendation: RecommendationResponse
  basePathRecFlow: string
  recommendationStatus: RecommendationResponse.status
  crn: string
  hasSpoRole: boolean
}) => {
  const caseOverviewPath = `${routeUrls.cases}/${crn}/overview`

  // SPO / manager decision
  const managerDecisionForms = ['manager-record-decision', 'manager-record-decision-delius']
  const managerDecisionPages = [...managerDecisionForms, 'manager-view-decision', 'manager-decision-confirmation']
  if (managerDecisionPages.includes(requestedPageId)) {
    if (hasSpoRole === false) {
      return caseOverviewPath
    }
  } else if (hasSpoRole === true) {
    return caseOverviewPath
  }
  if (managerDecisionForms.includes(requestedPageId)) {
    const isManagerDecisionSaved = recommendation.managerRecallDecision?.isSentToDelius === true
    if (isManagerDecisionSaved) {
      return `${basePathRecFlow}manager-view-decision`
    }
  }

  // task lists / confirmation pages
  const recallType = recommendation?.recallType?.selected?.value
  const isRecall = [RecallTypeSelectedValue.value.STANDARD, RecallTypeSelectedValue.value.FIXED_TERM].includes(
    recallType
  )
  const isNoRecall = RecallTypeSelectedValue.value.NO_RECALL === recallType
  const isNotSet = !isDefined(recallType)
  const isRecallTaskListRequested = requestedPageId === 'task-list'
  const isNoRecallTaskListRequested = requestedPageId === 'task-list-no-recall'
  const isCompletedRecommendation = recommendationStatus === RecommendationResponse.status.DOCUMENT_DOWNLOADED
  const isConfirmationPage = ['confirmation-part-a', 'confirmation-no-recall'].includes(requestedPageId)
  if (isCompletedRecommendation && !isConfirmationPage) {
    return caseOverviewPath
  }
  if (!isRecallTaskListRequested && !isNoRecallTaskListRequested) {
    return null
  }
  if ((isRecallTaskListRequested && isRecall) || (isNoRecallTaskListRequested && isNoRecall)) {
    return null
  }
  if ((isRecallTaskListRequested || isNoRecallTaskListRequested) && isNotSet) {
    return `${basePathRecFlow}response-to-probation`
  }
  if (isRecallTaskListRequested && isNoRecall) {
    return `${basePathRecFlow}task-list-no-recall`
  }
  if (isNoRecallTaskListRequested && isRecall) {
    return `${basePathRecFlow}task-list`
  }
}
