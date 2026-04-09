import { NextFunction, Request, Response } from 'express'
import { getDocumentContents } from '../../data/makeDecisionApiClient'
import { validateCrn } from '../../utils/utils'

const downloadDocument = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { crn, documentId } = req.params
  const normalizedCrn = validateCrn(crn)
  const {
    user: { token },
  } = res.locals
  const response = await getDocumentContents(normalizedCrn, documentId, token)
  res.set(response.headers)
  res.send(response.body)
}

export default downloadDocument
