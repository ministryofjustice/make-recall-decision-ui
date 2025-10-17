import { NextFunction, Request, Response } from 'express'
import {
  getDeterminateSentences,
  groupSentencesByCourtAndDate,
} from '../../../../helpers/ppudSentence/ppudSentenceHelper'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const determinateSentences = getDeterminateSentences(recommendation.ppudOffender.sentences)

  const determinateSentencesByCourt = groupSentencesByCourtAndDate(determinateSentences)

  const pageData = {
    determinateSentencesByCourt,
    fullName: recommendation.personOnProbation.name,
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'determinatePpudSentences',
    },
    recommendation,
    determinatePpudSentencesPageData: pageData,
  }

  res.render(`pages/recommendations/ppcs/determinateSentence/determinatePpudSentences`)
  next()
}

export default { get }
