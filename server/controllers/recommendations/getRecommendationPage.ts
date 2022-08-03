import { Request, Response } from 'express'
import { getRecommendation } from '../../data/makeDecisionApiClient'
import { getFormValues } from './helpers/getFormValues'
import { getPageMetaData } from './helpers/pageMetaData'

export const getRecommendationPage = async (req: Request, res: Response): Promise<void> => {
  const { recommendationId, pageId } = req.params
  const { templateName, pageHeading, pageTitle } = getPageMetaData(pageId)
  res.locals.recommendation = await getRecommendation(recommendationId, res.locals.user.token)
  res.locals.pageHeading = pageHeading
  res.locals.pageTitle = pageTitle
  // get values to preload into form inputs
  res.locals.formValues = getFormValues({
    errors: res.locals.errors,
    apiValues: res.locals.recommendation,
  })
  res.render(`pages/recommendations/${templateName}`)
}
