import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { deleteSupportingDocument, getSupportingDocuments } from '../../data/makeDecisionApiClient'

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
      id: 'supportingDocumentRemove',
    },
  }

  res.render(`pages/recommendations/supportingDocumentRemove`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId, id } = req.params

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  await deleteSupportingDocument({
    recommendationId,
    id,
    token,
    featureFlags: flags,
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'supporting-documents', urlInfo }))
}

export default { get, post }
