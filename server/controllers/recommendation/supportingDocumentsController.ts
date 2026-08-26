import { NextFunction, Request, Response } from 'express'
import {
  deleteSupportingDocument,
  getSupportingDocuments,
  uploadSupportingDocument,
} from '../../data/makeDecisionApiClient'
import { makeErrorObject } from '../../utils/errors'
import strings from '../../textStrings/en'
import { SupportingDocument } from '../../@types/make-recall-decision-api/models/SupportingDocumentsResponse'
import validateFileUploadRequest from '../recommendations/supportingDocuments/formValidator'
import { NamedFormError } from '../../@types/pagesForms'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    user: { token },
    flags,
  } = res.locals

  const documents = await getSupportingDocuments({ recommendationId, token, featureFlags: flags })

  res.locals = {
    ...res.locals,
    page: {
      id: 'supportingDocuments',
    },
    uploadedFiles: documents,
  }

  res.render(`pages/recommendations/supportingDocuments`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { xhr: isXhr } = req

  // Determine the action we're currently doing
  if (req.body?.delete) {
    return handleDelete(req, res)
  }

  if (Array.isArray(req.files) && req.files.length) {
    return handleUpload(req, res)
  }

  // Handle when there's no "action"
  if (isXhr) {
    return res.status(204).json({})
  }

  const errorId = 'missingFileUpload'

  req.session.errors = [
    makeErrorObject({
      id: 'file',
      text: strings.errors[errorId],
      errorId,
    }),
  ]
  return res.redirect(303, req.originalUrl)
}

/**
 * This is a break from the norm but lives here to keep the code grouped rather than
 * creating a new controller with no attached screens and just a post function
 */

async function handleDelete(req: Request, res: Response) {
  const { xhr: isXhr, params, body } = req
  const { recommendationId } = params
  const { delete: id } = body
  const {
    flags,
    user: { token },
  } = res.locals

  let errors: NamedFormError[] = []

  try {
    await deleteSupportingDocument({
      recommendationId,
      id,
      token,
      featureFlags: flags,
    })
  } catch (err) {
    const errorId = 'deleteFileFailure'
    errors = [
      makeErrorObject({
        id: 'file',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }

  const status = errors.length ? 400 : 204

  if (isXhr) {
    return res.status(status).json({})
  }

  if (errors.length) {
    req.session.errors = errors
  }

  return res.redirect(303, req.originalUrl)
}

async function handleUpload(req: Request, res: Response) {
  const { xhr: isXhr } = req
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
  } = res.locals

  const files = Array.isArray(req.files) ? req.files : []
  const file = files?.[0]

  const existingDocuments = await getSupportingDocuments({ recommendationId, token, featureFlags: flags })

  let errors = validateFileUploadRequest(file, existingDocuments)

  // Bail out early if we've already found errors
  if (errors.length) {
    // AJAX error return
    if (isXhr) {
      return res.status(400).json({
        error: {
          message: errors.map(err => err.text).join(' '),
        },
      })
    }

    req.session.errors = errors
    return res.redirect(303, req.originalUrl)
  }

  const data = file.buffer.toString('base64')

  let uploadResult: SupportingDocument

  try {
    uploadResult = await uploadSupportingDocument({
      recommendationId,
      token,
      title: '',
      filename: file.originalname,
      mimetype: file.mimetype,
      type: '', // No longer needed
      data,
      featureFlags: flags,
    })
  } catch (err) {
    const errorId = 'uploadFileFailure'
    errors = [
      makeErrorObject({
        id: 'file',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }

  let status = 201
  const { buffer, ...fileDetails } = file

  // XHR response
  if (isXhr) {
    let response

    if (errors.length) {
      status = 400
      response = {
        success: false,
      }
    } else {
      response = {
        success: true,
        file: {
          ...fileDetails,
          id: uploadResult?.id,
        },
      }
    }

    return res.status(status).json(response)
  }

  // Standard HTTP response (JS disabled)
  if (errors.length) {
    // Only set this once we're past the XHR stuff,
    // as it'll retain until the next screen
    req.session.errors = errors
  }
  return res.redirect(303, req.originalUrl)
}

export default { get, post }
