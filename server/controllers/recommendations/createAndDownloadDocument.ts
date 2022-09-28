import { Request, Response } from 'express'
import { createDocument } from '../../data/makeDecisionApiClient'

type DocumentType = 'PART_A' | 'NO_RECALL_LETTER'

export const createAndDownloadDocument =
  (documentType: DocumentType) =>
  async (req: Request, res: Response): Promise<Response | void> => {
    const { recommendationId } = req.params
    const { user } = res.locals
    let pathSuffix = 'no-recall-letter'
    const requestBody: Record<string, unknown> = {
      format: 'download-docx',
    }
    if (documentType === 'PART_A') {
      pathSuffix = 'part-a'
      requestBody.userEmail = user.email
    }
    const { fileName, fileContents } = await createDocument(recommendationId, pathSuffix, requestBody, user.token)
    res.contentType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.header('Content-Disposition', `attachment; filename="${fileName}"`)
    res.send(Buffer.from(fileContents, 'base64'))
  }
