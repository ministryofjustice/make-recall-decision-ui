import { UrlInfo } from '../../../@types'
import { RecallTypeSelectedValue } from '../../../@types/make-recall-decision-api/models/RecallTypeSelectedValue'
import { isNotNullOrUndefined } from '../../../utils/utils'

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

export const validateUpdateRecommendationPageRequest = ({
  requestedPageId,
  recallType,
}: {
  requestedPageId: string
  recallType?: RecallTypeSelectedValue.value
}) => {
  const isRecall = [RecallTypeSelectedValue.value.STANDARD, RecallTypeSelectedValue.value.FIXED_TERM].includes(
    recallType
  )
  const isNoRecall = RecallTypeSelectedValue.value.NO_RECALL === recallType
  const isNotSet = !isNotNullOrUndefined(recallType)
  const isRecallTaskListRequested = requestedPageId === 'task-list'
  const isNoRecallTaskListRequested = requestedPageId === 'task-list-no-recall'

  if (!isRecallTaskListRequested && !isNoRecallTaskListRequested) {
    return null
  }
  if ((isRecallTaskListRequested && isRecall) || (isNoRecallTaskListRequested && isNoRecall)) {
    return null
  }
  if ((isRecallTaskListRequested || isNoRecallTaskListRequested) && isNotSet) {
    return 'response-to-probation'
  }
  if (isRecallTaskListRequested && isNoRecall) {
    return 'task-list-no-recall'
  }
  if (isNoRecallTaskListRequested && isRecall) {
    return 'task-list'
  }
}
