import { Request, Response } from 'express'
import { createPartA } from '../../data/makeDecisionApiClient'

export const createAndDownloadPartA = async (req: Request, res: Response): Promise<Response | void> => {
  const { recommendationId } = req.params
  const { user } = res.locals
  const { fileName, fileContents } = await createPartA(recommendationId, { userEmail: user.email }, user.token)
  res.contentType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  res.header('Content-Disposition', `attachment; filename="${fileName}"`)
  res.send(Buffer.from(fileContents, 'base64'))
}
