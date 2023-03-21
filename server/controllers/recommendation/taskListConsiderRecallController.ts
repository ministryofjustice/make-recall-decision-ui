import { NextFunction, Request, Response } from 'express'
import { hasData } from '../../utils/utils'
import { renderStrings } from '../recommendations/helpers/renderStrings'
import { strings } from '../../textStrings/en'

const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { recommendation } = res.locals

  const allTasksCompleted =
    hasData(recommendation.whatLedToRecall) &&
    hasData(recommendation.responseToProbation) &&
    hasData(recommendation.licenceConditionsBreached) &&
    hasData(recommendation.alternativesToRecallTried) &&
    hasData(recommendation.isExtendedSentence) &&
    hasData(recommendation.isIndeterminateSentence)

  const stringRenderParams = {
    fullName: recommendation.personOnProbation.name,
  }

  res.locals = {
    ...res.locals,
    pageHeadings: renderStrings(strings.pageHeadings, stringRenderParams),
    pageTitles: renderStrings(strings.pageHeadings, { fullName: 'the person' }),
    allTasksCompleted,
    page: {
      id: 'taskListConsiderRecall',
    },
  }

  res.render(`pages/recommendations/taskListConsiderRecall`)
  next()
}

export default { get }
