import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { isDefined, isMandatoryTextValue, isString } from '../../utils/utils'
import { getSupportingDocuments, replaceSupportingDocument } from '../../data/makeDecisionApiClient'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId, id } = req.params

  const {
    user: { token },
    flags,
    unsavedValues,
  } = res.locals

  const documents = await getSupportingDocuments({ recommendationId, token, featureFlags: flags })

  const document = documents.find(doc => String(doc.id) === id)

  res.locals = {
    ...res.locals,
    document,
    page: {
      id: 'additionalSupportingDocumentReplace',
    },
    inputDisplayValues: {
      errors: res.locals.errors,
      title: isDefined(res.locals.errors) ? unsavedValues.title : document.title,
    },
  }

  res.render(`pages/recommendations/additionalSupportingDocumentReplace`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId, id } = req.params
  const { title } = req.body
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const documents = await getSupportingDocuments({ recommendationId, token, featureFlags: flags })

  const document = documents.find(doc => String(doc.id) === id)

  if (req.file || title !== document.title) {
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
    } else {
      const isTitleTaken = !!documents.filter(doc => String(doc.id) !== id).find(doc => doc.title === title)
      if (isTitleTaken) {
        const errorId = 'duplicateTitle'
        errors.push(
          makeErrorObject({
            id: 'title',
            text: strings.errors[errorId],
            errorId,
          })
        )
      } else if (isString(title) && title.length > 250) {
        const errorId = 'titleLengthExceeded'
        errors.push(
          makeErrorObject({
            id: 'title',
            text: strings.errors[errorId],
            errorId,
          })
        )
      }
    }

    if (isDefined(req.file)) {
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
    }

    if (errors.length > 0) {
      req.session.errors = errors
      req.session.unsavedValues = {
        title,
      }
      return res.redirect(303, req.originalUrl)
    }

    const data = req.file ? req.file.buffer.toString('base64') : undefined

    try {
      await replaceSupportingDocument({
        recommendationId,
        id,
        token,
        title,
        filename: req.file && req.file.originalname,
        mimetype: req.file && req.file.mimetype,
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
      req.session.unsavedValues = {
        title,
      }
      return res.redirect(303, req.originalUrl)
    }
  }
  res.redirect(303, nextPageLinkUrl({ nextPageId: 'supporting-documents', urlInfo }))
}

export default { get, post }
