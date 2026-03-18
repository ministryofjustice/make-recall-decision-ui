import { RecallTypeSelectedValue } from '../../../@types/make-recall-decision-api/models/RecallTypeSelectedValue'
import { isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'
import routeUrls from '../../../routes/routeUrls'
import type { FeatureFlags } from '../../../@types/featureFlags'
import { UrlInfo } from '../../../@types/pagesForms'

/**
 * Determines the URL for the next page.
 *
 * The following priority is followed to determine the URL:
 *  1. If URL info with fromPageId is present, use that.
 *  2. If nextPagePath is provided, use that.
 *  3. Otherwise, construct the URL using the basePath and nextPageId.
 *
 * @param nextPageId - the URL slug for the next page, which will be appended to the basePath to construct the URL if
 *                     relevant
 * @param nextPagePath - an optional URL path for the next page, which takes precedence over nextPageId if provided
 * @param urlInfo - the URL information, including fromPageId (if any), fromHeading (if any) and basePath
 */
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

/**
 * Determines the URL using the fromPageId and fromAnchor query parameters, if they exist (null otherwise).
 *
 * This is used to return the user to the page they came from, rather than the next page in the sequence.
 *
 * @param urlInfo The URL information, including fromPageId (if any), fromAnchor (if any), and basePath.
 */
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

export const nextPagePreservingFromPageAndAnchor = ({
  pageUrlSlug,
  urlInfo,
}: {
  pageUrlSlug: string
  urlInfo: UrlInfo
}) => {
  const { basePath, fromPageId, fromAnchor } = urlInfo
  const queryParam = `${fromPageId ? `?fromPageId=${fromPageId}` : ''}${fromAnchor ? `${fromPageId ? '&' : '?'}fromAnchor=${fromAnchor}` : ''}`
  return `${basePath}${pageUrlSlug}${queryParam}`
}

export const checkForRedirectPath = ({
  requestedPageId,
  recommendation,
  basePathRecFlow,
  recommendationStatus,
  crn,
}: {
  requestedPageId: string
  recommendation: RecommendationResponse
  basePathRecFlow: string
  recommendationStatus: RecommendationResponse.status
  crn: string
  hasSpoRole: boolean
  featureFlags: FeatureFlags
}) => {
  const caseOverviewPath = `${routeUrls.cases}/${crn}/overview`
  const isRecallTaskListRequested = requestedPageId === 'task-list'
  const isNoRecallTaskListRequested = requestedPageId === 'task-list-no-recall'

  // task lists / confirmation pages
  const recallType = recommendation?.recallType?.selected?.value
  const isRecall = [RecallTypeSelectedValue.value.STANDARD, RecallTypeSelectedValue.value.FIXED_TERM].includes(
    recallType,
  )
  const isNoRecall = RecallTypeSelectedValue.value.NO_RECALL === recallType
  const isNotSet = !isDefined(recallType)
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

  return null
}
