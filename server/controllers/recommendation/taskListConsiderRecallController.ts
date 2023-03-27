import { NextFunction, Request, Response } from 'express'
import { hasData } from '../../utils/utils'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const triggerLeadingToRecallCompleted = hasData(recommendation.triggerLeadingToRecall)
  const responseToProbationCompleted = hasData(recommendation.responseToProbation)
  const licenceConditionsBreachedCompleted = hasData(recommendation.licenceConditionsBreached)
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

export default { get }
