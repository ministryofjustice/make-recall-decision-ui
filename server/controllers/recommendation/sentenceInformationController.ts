import { NextFunction, Request, Response } from 'express'
import inputDisplayValuesSentenceInformation from '../recommendations/sentenceInformation/inputDisplayValues'
import validateSentenceInformation from '../recommendations/sentenceInformation/formValidator'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import ppPaths from '../../routes/paths/pp'
import getCaseSection from '../caseSummary/getCaseSection'
import { sentenceGroup } from '../recommendations/sentenceInformation/formOptions'
import { renderString } from '../../utils/nunjucks'

async function get(req: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    urlInfo: { basePath },
    user: { token, userId },
    flags,
  } = res.locals

  let backLinkUrl

  if (req.query?.fromPageId !== 'task-list-no-recall') {
    backLinkUrl = `${basePath}${ppPaths.taskListConsiderRecall}`
  }

  const { caseSummary } = await getCaseSection('overview', recommendation.crn, token, userId, req.query, flags)

  const stringRenderParams = {
    fullName: recommendation.personOnProbation.name,
  }
  const sentenceGroups = sentenceGroup.map(group => {
    return {
      text: group.text,
      value: group.value,
      hint: group.detailsLabel ? { text: renderString(group.detailsLabel, stringRenderParams) } : undefined,
    }
  })

  const inputDisplayValues = inputDisplayValuesSentenceInformation({
    errors: res.locals.errors,
    unsavedValues: res.locals.unsavedValues,
    apiValues: recommendation,
  })

  res.locals = {
    ...res.locals,
    pageData: {
      page: {
        id: 'sentenceInformation',
      },
      caseSummary,
      sentenceGroups,
      fullName: recommendation.personOnProbation.name,
      inputDisplayValues,
      backLinkUrl,
    },
  }

  res.render('pages/recommendations/sentenceInformation')
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues, nextPagePath } = await validateSentenceInformation({
    requestBody: req.body,
    recommendationId,
    urlInfo,
    token,
  })

  if (errors) {
    req.session.errors = errors
    req.session.unsavedValues = unsavedValues
    return res.redirect(303, req.originalUrl)
  }

  await updateRecommendation({
    recommendationId,
    token,
    valuesToSave,
    featureFlags: flags,
  })

  return res.redirect(303, nextPagePath)
}

export default { get, post }
