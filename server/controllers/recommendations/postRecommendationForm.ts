import { Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import logger from '../../../logger'
import { saveErrorWithDetails } from '../../utils/errors'
import { routeUrls } from '../../routes/routeUrls'
import { pageMetaData } from './helpers/pageMetaData'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { isEmptyStringOrWhitespace, normalizeCrn } from '../../utils/utils'

/**
 * @deprecated get rid of these grand controllers - too much logic merged together
 */
export const postRecommendationForm = async (req: Request, res: Response): Promise<void> => {
  const { recommendationId, pageUrlSlug } = req.params
  const currentPagePath = `${routeUrls.recommendations}/${recommendationId}/${pageUrlSlug}`
  try {
    const { validator } = pageMetaData(pageUrlSlug)
    const {
      flags,
      user: { token, username, region },
      urlInfo,
    } = res.locals
    const {
      errors,
      valuesToSave,
      unsavedValues,
      nextPagePath,
      monitoringEvent,
      apiEndpointPathSuffix,
      confirmationMessage,
    } = await validator({
      requestBody: req.body,
      recommendationId,
      urlInfo,
      token,
    })
    if (errors) {
      req.session.errors = errors
      req.session.unsavedValues = unsavedValues
      return res.redirect(303, currentPagePath)
    }
    await updateRecommendation({
      recommendationId,
      valuesToSave,
      token,
      featureFlags: flags,
      pathSuffix: apiEndpointPathSuffix,
    })
    if (confirmationMessage) {
      req.session.confirmationMessage = confirmationMessage
    }
    res.redirect(303, nextPagePath)
    if (monitoringEvent) {
      const crn = normalizeCrn(req.body.crn)
      if (!isEmptyStringOrWhitespace(crn)) {
        appInsightsEvent(
          monitoringEvent.eventName,
          username,
          {
            ...monitoringEvent.data,
            crn,
            recommendationId,
            region,
          },
          flags
        )
      }
    }
  } catch (err) {
    if (err.name === 'AppError') {
      throw err
    }
    logger.error(err)
    req.session.errors = [saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' })]
    res.redirect(303, currentPagePath)
  }
}
