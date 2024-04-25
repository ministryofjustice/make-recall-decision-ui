import { NextFunction, Request, Response } from 'express'
import { getSupportingDocuments } from '../../data/makeDecisionApiClient'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params

  const {
    user: { token },
    flags,
    recommendation,
  } = res.locals

  const documents = await getSupportingDocuments({ recommendationId, token, featureFlags: flags })

  const PPUDPartA = documents.find(doc => doc.type === 'PPUDPartA')
  const PPUDLicenceDocument = documents.find(doc => doc.type === 'PPUDLicenceDocument')
  const PPUDProbationEmail = documents.find(doc => doc.type === 'PPUDProbationEmail')
  const PPUDOASys = documents.find(doc => doc.type === 'PPUDOASys')
  const PPUDPrecons = documents.find(doc => doc.type === 'PPUDPrecons')
  const PPUDPSR = documents.find(doc => doc.type === 'PPUDPSR')
  const PPUDChargeSheet = documents.find(doc => doc.type === 'PPUDChargeSheet')

  res.locals = {
    ...res.locals,
    PPUDPartA,
    PPUDLicenceDocument,
    PPUDProbationEmail,
    PPUDOASys,
    PPUDPrecons,
    PPUDPSR,
    PPUDChargeSheet,
    minutes: (recommendation as RecommendationResponse)?.bookRecallToPpud?.minutes,
    page: {
      id: 'supportingDocuments',
    },
  }

  res.render(`pages/recommendations/supportingDocuments`)
  next()
}

export default { get }
