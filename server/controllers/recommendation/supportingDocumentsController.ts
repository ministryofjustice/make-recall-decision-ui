import { NextFunction, Request, Response } from 'express'
import { getSupportingDocuments } from '../../data/makeDecisionApiClient'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params

  const {
    user: { token },
    flags,
  } = res.locals

  const documents = await getSupportingDocuments({ recommendationId, token, featureFlags: flags })

  res.locals = {
    ...res.locals,
    documents: [
      documents.PPUDPartA,
      documents.PPUDLicenceDocument,
      documents.PPUDProbationEmail,
      documents.PPUDOASys,
      documents.PPUDPrecons,
      documents.PPUDPSR,
      documents.PPUDChargeSheet,
    ],
    page: {
      id: 'supportingDocuments',
    },
  }

  res.render(`pages/recommendations/supportingDocuments`)
  next()
}

export default { get }
