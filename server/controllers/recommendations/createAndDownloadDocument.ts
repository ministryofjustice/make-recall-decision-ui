import { Request, Response } from 'express'
import { createDocument } from '../../data/makeDecisionApiClient'
import { trackEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'

type DocumentType = 'PART_A' | 'NO_RECALL_LETTER'

export const createAndDownloadDocument =
  (documentType: DocumentType) =>
  async (req: Request, res: Response): Promise<Response | void> => {
    const { recommendationId } = req.params
    const { crn } = req.query
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

    if (documentType === 'PART_A') {
      trackEvent(EVENTS.PART_A_DOCUMENT_DOWNLOADED, crn as string, user.username)
    } else {
      trackEvent(EVENTS.DECISION_NOT_TO_RECALL_LETTER_DOWNLOADED, crn as string, user.username)
    }

    res.contentType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.header('Content-Disposition', `attachment; filename="${fileName}"`)
    res.send(Buffer.from(fileContents, 'base64'))
  }
