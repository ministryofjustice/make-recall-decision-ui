import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { isMandatoryTextValue } from '../../utils/utils'
import { uploadSupportingDocument } from '../../data/makeDecisionApiClient'

async function get(req: Request, res: Response, next: NextFunction) {
  const { type } = req.params

  res.locals = {
    ...res.locals,
    type,
    page: {
      id: 'additionalSupportingDocumentUpload',
    },
  }

  res.render(`pages/recommendations/additionalSupportingDocumentUpload`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { title } = req.body
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  if (req.file) {
    const errors = []

    if (!isMandatoryTextValue(title)) {
      const errorId = 'missingTitle'
      errors.push(
        makeErrorObject({
          id: 'title',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }

    if (req.file.size > 500 * 1024) {
      const errorId = 'fileSizeExceeded'
      errors.push(
        makeErrorObject({
          id: 'file',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }

    if (!req.file.originalname.match(/^[.A-Za-z0-9!_-]+$/)) {
      const errorId = 'invalidFilename'
      errors.push(
        makeErrorObject({
          id: 'file',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }

    if (errors.length > 0) {
      req.session.errors = errors
      return res.redirect(303, req.originalUrl)
    }

    const data = req.file.buffer.toString('base64')

    try {
      await uploadSupportingDocument({
        recommendationId,
        token,
        title,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        type: 'OtherDocument',
        data,
        featureFlags: flags,
      })
    } catch (err) {
      const errorId = 'uploadFileFailure'
      req.session.errors = [
        makeErrorObject({
          id: 'file',
          text: strings.errors[errorId],
          errorId,
        }),
      ]
      return res.redirect(303, req.originalUrl)
    }
  }
  res.redirect(303, nextPageLinkUrl({ nextPageId: 'supporting-documents', urlInfo }))
}

export default { get, post }
