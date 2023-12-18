import { NextFunction, Request, Response } from 'express'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const offence = (recommendation as RecommendationResponse).nomisIndexOffence.allOptions.find(
    o => o.offenderChargeId === recommendation.nomisIndexOffence.selected
  )

  res.locals = {
    ...res.locals,
    page: {
      id: 'indexOffenceSelected',
    },
    offence,
  }

  res.render(`pages/recommendations/indexOffenceSelected`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { urlInfo } = res.locals

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'match-index-offence', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
