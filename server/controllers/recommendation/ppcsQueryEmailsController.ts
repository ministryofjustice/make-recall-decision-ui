import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { isEmailValid } from '../../utils/validate-formats'
import { isEmptyStringOrWhitespace } from '../../utils/utils'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation, unsavedValues } = res.locals

  let ppcsQueryEmails = ['']

  if (recommendation.ppcsQueryEmails) {
    ppcsQueryEmails = recommendation.ppcsQueryEmails
  }

  if (unsavedValues) {
    ppcsQueryEmails = unsavedValues.ppcsQueryEmails
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'ppcsQueryEmails',
    },
    inputDisplayValues: {
      errors: res.locals.errors,
      ppcsQueryEmails,
    },
  }

  res.render(`pages/recommendations/ppcsQueryEmails`)
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
  const ppcsQueryEmails: string[] = []
  for (let i = 0; i < Number(size); i += 1) {
    const recipient = req.body[`email_${i}`]
    ppcsQueryEmails.push(recipient)
    if (!isEmptyStringOrWhitespace(recipient) && !isEmailValid(recipient)) {
      const errorId = 'invalidPPCSEmail'
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
      ppcsQueryEmails.splice(i, 1)
    }
  }

  const addOp = 'add' in req.body
  if (addOp) {
    ppcsQueryEmails.push('')
  }

  const normalizedEmails = ppcsQueryEmails.filter(email => !isEmptyStringOrWhitespace(email))
  if (normalizedEmails.length === 0) {
    const errorId = 'missingPPCSEmail'
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
      ppcsQueryEmails,
    }
    return res.redirect(303, req.originalUrl)
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      ppcsQueryEmails: normalizedEmails,
    },
    token,
    featureFlags: flags,
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'task-list', urlInfo }))
}

export default { get, post }
