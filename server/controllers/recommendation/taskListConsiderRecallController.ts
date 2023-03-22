import { NextFunction, Request, Response } from 'express'
import { hasData } from '../../utils/utils'
import { renderStrings } from '../recommendations/helpers/renderStrings'
import { strings } from '../../textStrings/en'

const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

  const stringRenderParams = {
    fullName: recommendation.personOnProbation.name,
  }

  res.locals = {
    ...res.locals,
    pageHeadings: renderStrings(strings.pageHeadings, stringRenderParams),
    pageTitles: renderStrings(strings.pageHeadings, { fullName: 'the person' }),
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
