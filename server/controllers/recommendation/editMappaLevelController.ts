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

  const list = await ppudReferenceList(token, 'mappa-levels')

  const mappaLevels = list.values.map(value => {
    return {
      text: value,
      value,
    }
  })

  res.locals = {
    ...res.locals,
    page: {
      id: 'editMappaLevel',
    },
    mappaLevels,
    errors: res.locals.errors,
  }

  res.render(`pages/recommendations/editMappaLevel`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { mappaLevel } = req.body

  const {
    user: { token },
    urlInfo,
    flags,
  } = res.locals

  if (!isDefined(mappaLevel) || mappaLevel.trim().length === 0) {
    const errorId = 'missingMappaLevel'

    req.session.errors = [
      makeErrorObject({
        id: 'mappaLevel',
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
        mappaLevel,
      },
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'check-booking-details', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
