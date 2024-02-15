import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { uploadSupportingDocument } from '../../data/makeDecisionApiClient'
import { SupportingDocumentType } from '../../@types/make-recall-decision-api/models/SupportingDocumentsResponse'

const typeLookup: Record<string, SupportingDocumentType> = {
  'part-a': SupportingDocumentType.PPUDPartA,
  'licence-document': SupportingDocumentType.PPUDLicenceDocument,
  'probation-email': SupportingDocumentType.PPUDProbationEmail,
  oasys: SupportingDocumentType.PPUDOASys,
  precons: SupportingDocumentType.PPUDPrecons,
  psr: SupportingDocumentType.PPUDPSR,
  'charge-sheet': SupportingDocumentType.PPUDChargeSheet,
}

async function get(req: Request, res: Response, next: NextFunction) {
  const { type } = req.params

  res.locals = {
    ...res.locals,
    type,
    page: {
      id: 'supportingDocumentUpload',
    },
  }

  res.render(`pages/recommendations/supportingDocumentUpload`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { type } = req.body
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  if (req.file) {
    const data = req.file.buffer.toString('base64')

    await uploadSupportingDocument({
      recommendationId,
      token,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      type: SupportingDocumentType[typeLookup[type].valueOf()],
      data,
      featureFlags: flags,
    })
  }
  res.redirect(303, nextPageLinkUrl({ nextPageId: 'supporting-documents', urlInfo }))
}

export default { get, post }
