import { Request, Response } from 'express'
import { createDocument } from '../../data/makeDecisionApiClient'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'
import { isPreprodOrProd, validateCrn } from '../../utils/utils'
import { AuditService } from '../../services/auditService'

const auditService = new AuditService()

type DocumentType = 'PART_A' | 'NO_RECALL_LETTER'

export const createAndDownloadDocument =
  (documentType: DocumentType) =>
  async (req: Request, res: Response): Promise<Response | void> => {
    const { recommendationId } = req.params
    const { crn } = req.query
    const normalizedCrn = validateCrn(crn)
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

    const auditData = {
      crn: normalizedCrn,
      recommendationId,
      username: user.username,
      logErrors: isPreprodOrProd(res.locals.env) && process.env.NODE_ENV !== 'test',
    }
    if (documentType === 'PART_A') {
      auditService.createPartA(auditData)
      appInsightsEvent(EVENTS.PART_A_DOCUMENT_DOWNLOADED, normalizedCrn, user.username, recommendationId)
    } else {
      auditService.createNoRecallLetter(auditData)
      appInsightsEvent(EVENTS.DECISION_NOT_TO_RECALL_LETTER_DOWNLOADED, normalizedCrn, user.username, recommendationId)
    }
  }
