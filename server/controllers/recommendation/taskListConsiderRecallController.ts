import { NextFunction, Request, Response } from 'express'
import { hasData } from '../../utils/utils'
import { getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const triggerLeadingToRecallCompleted = hasData(recommendation.triggerLeadingToRecall)
  const licenceConditionsBreachedCompleted =
    hasData(recommendation.licenceConditionsBreached) ||
    hasData(recommendation.cvlLicenceConditionsBreached) ||
    !!recommendation.additionalLicenceConditionsText?.length
  const alternativesToRecallTriedCompleted = hasData(recommendation.alternativesToRecallTried)
  const sentenceGroupCompleted = hasData(recommendation.sentenceGroup)
  const indeterminateSentenceTypeCompleted = hasData(recommendation.indeterminateSentenceType)

  const allTasksCompleted =
    triggerLeadingToRecallCompleted &&
    licenceConditionsBreachedCompleted &&
    alternativesToRecallTriedCompleted &&
    sentenceGroupCompleted &&
    (recommendation.sentenceGroup !== SentenceGroup.INDETERMINATE || indeterminateSentenceTypeCompleted)
  res.locals = {
    ...res.locals,
    flagFTR56Enabled: true,
    backLinkUrl: `/cases/${recommendation.crn}/overview`,
    isIndeterminateSentence: recommendation.sentenceGroup === SentenceGroup.INDETERMINATE,
    triggerLeadingToRecallCompleted,
    licenceConditionsBreachedCompleted,
    alternativesToRecallTriedCompleted,
    sentenceGroupCompleted,
    indeterminateSentenceTypeCompleted,
    allTasksCompleted,
    page: {
      id: 'taskListConsiderRecall',
    },
  }

  res.render(`pages/recommendations/taskListConsiderRecall`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    user: { token },
    urlInfo,
  } = res.locals

  const statuses = await getStatuses({ recommendationId, token })

  const poRecallConsultSpo = statuses
    .filter(status => status.active)
    .find(status => status.name === 'PO_RECALL_CONSULT_SPO')

  if (poRecallConsultSpo === undefined) {
    await updateStatuses({
      recommendationId,
      token,
      activate: [STATUSES.SPO_CONSIDER_RECALL, STATUSES.PO_RECALL_CONSULT_SPO],
      deActivate: [],
    })
  }

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'record-consideration-rationale', urlInfo }))
}

export default { get, post }
