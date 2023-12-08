import { NextFunction, Request, Response } from 'express'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'

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

export default { get }
