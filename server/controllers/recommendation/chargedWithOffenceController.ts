import { Request, Response, NextFunction } from 'express'
import chargedWithOffenceOptions from '../recommendations/chargedWithOffence/formOptions'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import ppPaths from '../../routes/paths/pp.paths'
import { sharedPaths } from '../../routes/paths/shared.paths'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { makeErrorObject } from '../../utils/errors'

async function get(req: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'chargedWithOffence',
    },
    chargedWithOffenceOptions,
  }

  res.render('pages/recommendations/chargedWithOffence')
  next()
}

async function post(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    urlInfo,
    flags: featureFlags,
    user: { token },
    recommendation,
  } = res.locals

  const { _csrf, ...valuesToSave } = req.body

  if (!valuesToSave.isRecalledOnNewChargedOrConvictedOffence) {
    req.session.errors = [
      makeErrorObject({
        id: 'isRecalledOnNewChargedOrConvictedOffence',
        text: `Select if ${recommendation.personOnProbation.name} has been charged or convicted for an offence`,
        errorId: 'missingisRecalledOnNewChargedOrConvictedOffence',
      }),
    ]
    return res.redirect(303, req.originalUrl)
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave,
    token,
    featureFlags,
  })

  const nextPagePath = `${sharedPaths.recommendations}/${recommendationId}/${ppPaths.suitabilityForFixedTermRecall}`
  return res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
