import { Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import logger from '../../../logger'
import { saveErrorWithDetails } from '../../utils/errors'
import { routeUrls } from '../../routes/routeUrls'
import { pageMetaData } from './helpers/pageMetaData'

export const postRecommendationForm = async (req: Request, res: Response): Promise<void> => {
  const { recommendationId, pageUrlSlug } = req.params
  const currentPagePath = `${routeUrls.recommendations}/${recommendationId}/${pageUrlSlug}`
  try {
    const { validator } = pageMetaData(pageUrlSlug)
    const { user, urlInfo } = res.locals
    const { errors, valuesToSave, unsavedValues, nextPagePath } = await validator({
      requestBody: req.body,
      recommendationId,
      urlInfo,
      token: user.token,
    })
    if (errors) {
      req.session.errors = errors
      req.session.unsavedValues = unsavedValues
      return res.redirect(303, currentPagePath)
    }
    await updateRecommendation(recommendationId, valuesToSave, user.token, res.locals.flags)
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
