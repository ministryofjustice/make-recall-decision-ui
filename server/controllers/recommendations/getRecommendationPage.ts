import { Request, Response } from 'express'
import { getRecommendation } from '../../data/makeDecisionApiClient'
import { pageMetaData } from './helpers/pageMetaData'
import { formOptions } from './helpers/formOptions'

export const getRecommendationPage = async (req: Request, res: Response): Promise<void> => {
  const { recommendationId, pageId } = req.params
  const { templateName, pageHeading, pageTitle, inputDisplayValues } = pageMetaData(pageId)
  res.locals.recommendation = await getRecommendation(recommendationId, res.locals.user.token)
  res.locals.pageHeading = pageHeading
  res.locals.pageTitle = pageTitle
  // get values to preload into form inputs
  if (inputDisplayValues) {
    res.locals.inputDisplayValues = inputDisplayValues({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: res.locals.recommendation,
    })
  }
  res.locals.formOptions = formOptions
  res.render(`pages/recommendations/${templateName}`)
}
