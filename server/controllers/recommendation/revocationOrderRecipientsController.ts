import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { isEmailValid } from '../../utils/validate-formats'
import { isEmptyStringOrWhitespace } from '../../utils/utils'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation, unsavedValues } = res.locals

  let revocationOrderRecipients = ['']

  if (recommendation.revocationOrderRecipients) {
    revocationOrderRecipients = recommendation.revocationOrderRecipients
  }

  if (unsavedValues) {
    revocationOrderRecipients = unsavedValues.revocationOrderRecipients
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'revocationOrderRecipients',
    },
    inputDisplayValues: {
      errors: res.locals.errors,
      revocationOrderRecipients,
    },
  }

  res.render(`pages/recommendations/revocationOrderRecipients`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { size } = req.body

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const errors = []
  const revocationOrderRecipients: string[] = []
  for (let i = 0; i < Number(size); i += 1) {
    const recipient = req.body[`email_${i}`]
    revocationOrderRecipients.push(recipient)
    if (!isEmptyStringOrWhitespace(recipient) && !isEmailValid(recipient)) {
      const errorId = 'invalidRecipientEmail'
      errors.push(
        makeErrorObject({
          id: `email_${i}`,
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
  }

  let removeOp = false
  for (let i = 0; i < Number(size); i += 1) {
    const remove = `remove_${i}` in req.body
    if (remove) {
      removeOp = true
      revocationOrderRecipients.splice(i, 1)
    }
  }

  const addOp = 'add' in req.body
  if (addOp) {
    revocationOrderRecipients.push('')
  }

  const normalizedRecipients = revocationOrderRecipients.filter(email => !isEmptyStringOrWhitespace(email))
  if (normalizedRecipients.length === 0) {
    const errorId = 'missingRecipientEmail'
    errors.push(
      makeErrorObject({
        id: 'email',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (errors.length > 0 || removeOp || addOp) {
    req.session.errors = errors.length > 0 ? errors : undefined
    req.session.unsavedValues = {
      revocationOrderRecipients,
    }
    return res.redirect(303, req.originalUrl)
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      revocationOrderRecipients: normalizedRecipients,
    },
    token,
    featureFlags: flags,
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'task-list', urlInfo }))
}

export default { get, post }
