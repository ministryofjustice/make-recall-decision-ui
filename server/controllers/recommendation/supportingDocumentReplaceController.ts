import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { getSupportingDocuments, replaceSupportingDocument } from '../../data/makeDecisionApiClient'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId, type, id } = req.params

  const {
    user: { token },
    flags,
  } = res.locals

  const documents = await getSupportingDocuments({ recommendationId, token, featureFlags: flags })

  const document = documents.find(doc => String(doc.id) === id)

  res.locals = {
    ...res.locals,
    type,
    document,
    page: {
      id: 'supportingDocumentReplace',
    },
  }

  res.render(`pages/recommendations/supportingDocumentReplace`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId, id } = req.params

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  if (req.file) {
    const errors = []

    if (req.file.size > 25000 * 1024) {
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
      await replaceSupportingDocument({
        recommendationId,
        token,
        title: '',
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        id,
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
