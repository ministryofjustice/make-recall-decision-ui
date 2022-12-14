import { Request, Response } from 'express'
import { createRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import { routeUrls } from '../../routes/routeUrls'
import { validateConsiderRecall } from './considerRecall/formValidator'
import logger from '../../../logger'
import { saveErrorWithDetails } from '../../utils/errors'

export const postConsiderRecall = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn, recommendationId } = req.body
  try {
    const {
      flags,
      user: { token },
    } = res.locals
    const { errors, valuesToSave, unsavedValues, nextPagePath } = await validateConsiderRecall({
      requestBody: req.body,
      token,
    })
    if (errors) {
      req.session.errors = errors
      req.session.unsavedValues = unsavedValues
      return res.redirect(303, nextPagePath)
    }
    if (recommendationId) {
      await updateRecommendation(recommendationId, valuesToSave, token, flags)
    } else {
      await createRecommendation(valuesToSave, token, flags)
    }
    res.redirect(303, nextPagePath)
  } catch (err) {
    if (err.name === 'AppError') {
      throw err
    }
    logger.error(err)
    req.session.errors = [saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' })]
    res.redirect(303, `${routeUrls.cases}/${crn}/consider-recall`)
  }
}
