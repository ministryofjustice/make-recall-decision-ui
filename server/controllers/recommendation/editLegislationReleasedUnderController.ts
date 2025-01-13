import { NextFunction, Request, Response } from 'express'
import { getRecommendation, ppudReferenceList, updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { isDefined } from '../../utils/utils'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'

async function get(_: Request, res: Response, next: NextFunction) {
  const {
    user: { token },
  } = res.locals

  const list = await ppudReferenceList(token, 'released-unders')

  const legislations = list.values.map(value => {
    return {
      text: value,
      value,
    }
  })
  legislations.unshift({
    text: 'Enter legislation',
    value: '',
  })

  res.locals = {
    ...res.locals,
    page: {
      id: 'editLegislationReleasedUnder',
    },
    legislations,
    errors: res.locals.errors,
  }

  res.render(`pages/recommendations/editLegislationReleasedUnder`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { legislationReleasedUnder } = req.body

  const {
    user: { token },
    urlInfo,
    flags,
  } = res.locals

  if (!isDefined(legislationReleasedUnder) || legislationReleasedUnder.trim().length === 0) {
    const errorId = 'missingLegislationReleasedUnder'

    req.session.errors = [
      makeErrorObject({
        id: 'legislationReleasedUnder',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
    return res.redirect(303, req.originalUrl)
  }

  const recommendation = await getRecommendation(recommendationId, token)

  await updateRecommendation({
    recommendationId: String(recommendation.id),
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        legislationReleasedUnder,
        legislationSentencedUnder: legislationReleasedUnder,
      },
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'check-booking-details', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
