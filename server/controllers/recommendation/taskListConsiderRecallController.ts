import { NextFunction, Request, Response } from 'express'
import { hasData } from '../../utils/utils'
import { getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const triggerLeadingToRecallCompleted = hasData(recommendation.triggerLeadingToRecall)
  const responseToProbationCompleted = hasData(recommendation.responseToProbation)
  const licenceConditionsBreachedCompleted =
    hasData(recommendation.licenceConditionsBreached) || hasData(recommendation.cvlLicenceConditionsBreached)
  const alternativesToRecallTriedCompleted = hasData(recommendation.alternativesToRecallTried)
  const isExtendedSentenceCompleted = hasData(recommendation.isExtendedSentence)
  const isIndeterminateSentenceCompleted = hasData(recommendation.isIndeterminateSentence)

  const allTasksCompleted =
    triggerLeadingToRecallCompleted &&
    responseToProbationCompleted &&
    licenceConditionsBreachedCompleted &&
    alternativesToRecallTriedCompleted &&
    isExtendedSentenceCompleted &&
    isIndeterminateSentenceCompleted

  res.locals = {
    ...res.locals,
    triggerLeadingToRecallCompleted,
    responseToProbationCompleted,
    licenceConditionsBreachedCompleted,
    alternativesToRecallTriedCompleted,
    isExtendedSentenceCompleted,
    isIndeterminateSentenceCompleted,
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
      activate: ['SPO_CONSIDER_RECALL', 'PO_RECALL_CONSULT_SPO'],
      deActivate: [],
    })
  }

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'share-case-with-manager', urlInfo }))
}

export default { get, post }
