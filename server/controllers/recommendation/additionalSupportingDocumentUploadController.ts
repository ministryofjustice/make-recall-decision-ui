import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { isDefined, isMandatoryTextValue, isString } from '../../utils/utils'
import { getSupportingDocuments, uploadSupportingDocument } from '../../data/makeDecisionApiClient'

async function get(req: Request, res: Response, next: NextFunction) {
  const { errors, unsavedValues } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'additionalSupportingDocumentUpload',
    },
    inputDisplayValues: {
      title: isDefined(errors) ? unsavedValues?.title : '',
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

  if (req.file || title) {
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
      const documents = await getSupportingDocuments({ recommendationId, token, featureFlags: flags })

      const isTitleTaken = !!documents.find(doc => doc.title === title)
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

    if (req.file) {
      if (req.file.size > 2500 * 1024) {
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
    } else {
      const errorId = 'missingFile'
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
      req.session.unsavedValues = {
        title,
      }
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
