import { NextFunction, Request, Response } from 'express'
import { renderStrings } from '../recommendations/helpers/renderStrings'
import { strings } from '../../textStrings/en'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { inputDisplayValuesIndeterminateSentenceType } from '../recommendations/indeterminateSentenceType/inputDisplayValues'
import { validateIndeterminateSentenceType } from '../recommendations/indeterminateSentenceType/formValidator'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { RecommendationStatusResponse } from '../../@types/make-recall-decision-api/models/RecommendationStatusReponse'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const stringRenderParams = {
    fullName: recommendation.personOnProbation.name,
  }

  res.locals = {
    ...res.locals,
    pageHeadings: renderStrings(strings.pageHeadings, stringRenderParams),
    pageTitles: renderStrings(strings.pageHeadings, { fullName: 'the person' }),
    page: {
      id: 'indeterminateSentenceType',
    },
  }

  res.locals.inputDisplayValues = inputDisplayValuesIndeterminateSentenceType({
    errors: res.locals.errors,
    unsavedValues: res.locals.unsavedValues,
    apiValues: recommendation,
  })

  res.render(`pages/recommendations/indeterminateSentenceType`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues } = await validateIndeterminateSentenceType({
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
    valuesToSave,
    token,
    featureFlags: flags,
  })

  const isApRationalRecorded = (res.locals.statuses as RecommendationStatusResponse[]).find(
    status => status.name === STATUSES.AP_RECORDED_RATIONALE && status.active
  )

  let nextPageId
  if (isApRationalRecorded) {
    nextPageId = 'recall-type-indeterminate'
  } else {
    nextPageId = 'task-list-consider-recall'
  }

  res.redirect(303, nextPageLinkUrl({ nextPageId, urlInfo }))
}

export default { get, post }
