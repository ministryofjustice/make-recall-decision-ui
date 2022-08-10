import { Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import logger from '../../../logger'
import { saveErrorWithDetails } from '../../utils/errors'
import { AppError } from '../../AppError'
import { routeUrls } from '../../routes/routeUrls'
import { pageMetaData } from './helpers/pageMetaData'

export const postRecommendationForm = async (req: Request, res: Response): Promise<void> => {
  const { recommendationId, pageId } = req.params
  const currentPagePath = `${routeUrls.recommendations}/${recommendationId}/${pageId}`
  try {
    if (!req.body.crn) {
      throw new AppError(`Invalid CRN: ${req.body.crn}`, { status: 400 })
    }
    const { validator } = pageMetaData(pageId)
    const { user } = res.locals
    const { errors, valuesToSave, unsavedValues, nextPagePath } = validator({
      requestBody: req.body,
      recommendationId,
    })
    if (errors) {
      req.session.errors = errors
      req.session.unsavedValues = unsavedValues
      return res.redirect(303, currentPagePath)
    }
    await updateRecommendation(recommendationId, valuesToSave, user.token)
    res.redirect(303, nextPagePath)
  } catch (err) {
    if (err.name === 'AppError') {
      throw err
    }
    logger.error(err)
    req.session.errors = [saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' })]
    res.redirect(303, currentPagePath)
  }
}
