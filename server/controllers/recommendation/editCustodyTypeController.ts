import { NextFunction, Request, Response } from 'express'
import { getRecommendation, ppudReferenceList, updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { isDefined } from '../../utils/utils'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { determinateCustodyTypeLabels } from '../recommendations/custody-type/formOptions'

async function get(_: Request, res: Response, next: NextFunction) {
  const {
    user: { token },
  } = res.locals

  const list = await ppudReferenceList(token, 'determinate-custody-types')

  const custodyTypes = list.values.map(value => {
    return {
      text: determinateCustodyTypeLabels[value] ?? value,
      value,
    }
  })

  res.locals = {
    ...res.locals,
    page: {
      id: 'editCustodyType',
    },
    custodyTypes,
    errors: res.locals.errors,
  }

  res.render(`pages/recommendations/editCustodyType`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { custodyType } = req.body

  const {
    user: { token },
    urlInfo,
    flags,
  } = res.locals

  if (!isDefined(custodyType) || custodyType.trim().length === 0) {
    const errorId = 'missingCustodyType'

    req.session.errors = [
      makeErrorObject({
        id: 'custodyType',
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
        custodyType,
      },
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'sentence-to-commit', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
