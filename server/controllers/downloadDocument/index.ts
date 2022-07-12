import { NextFunction, Request, Response } from 'express'
import { getDocumentContents } from '../../data/makeDecisionApiClient'

export const downloadDocument = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { crn, documentId } = req.params
    const {
      user: { token },
    } = res.locals
    const response = await getDocumentContents(crn, documentId, token)
    res.set(response.headers)
    res.send(response.body)
  } catch (err) {
    next(err)
  }
}
