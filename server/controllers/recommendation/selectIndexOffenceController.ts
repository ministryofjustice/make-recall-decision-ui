import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { prisonSentences } from '../../data/makeDecisionApiClient'

async function get(_: Request, res: Response, next: NextFunction) {
  const {
    user: { token },
    recommendation,
  } = res.locals

  const sentences = await prisonSentences(token, recommendation.personOnProbation.nomsNumber)

  let errorMessage
  if (sentences.length === 0) {
    errorMessage = 'No sentences found'
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'selectIndexOffence',
    },
    sentences,
    errorMessage,
  }

  res.render(`pages/recommendations/selectIndexOffence`)
  next()
}

async function post(_: Request, res: Response, next: NextFunction) {
  const { urlInfo } = res.locals

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'map-index-offence', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))

  next()
}

export default { get, post }
