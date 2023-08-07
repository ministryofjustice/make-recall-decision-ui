import { Request, Response } from 'express'
import { createDocument, getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'
import { isPreprodOrProd, validateCrn } from '../../utils/utils'
import { AuditService } from '../../services/auditService'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { HMPPS_AUTH_ROLE } from '../../middleware/authorisationMiddleware'

const auditService = new AuditService()

type DocumentType = 'PART_A' | 'NO_RECALL_LETTER'

export const createAndDownloadDocument =
  (documentType: DocumentType) =>
  async (req: Request, res: Response): Promise<Response | void> => {
    const { recommendationId } = req.params
    const { crn } = req.query
    const normalizedCrn = validateCrn(crn)
    const { user, flags } = res.locals
    let pathSuffix = 'no-recall-letter'
    const requestBody: Record<string, unknown> = {
      format: 'download-docx',
    }
    if (documentType === 'PART_A') {
      pathSuffix = 'part-a'
      requestBody.userEmail = user.email
    }
    const { fileName, fileContents } = await createDocument(
      recommendationId,
      pathSuffix,
      requestBody,
      user.token,
      flags
    )
    res.contentType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.header('Content-Disposition', `attachment; filename="${fileName}"`)
    res.send(Buffer.from(fileContents, 'base64'))

    const activate = []
    const statuses = (
      await getStatuses({
        recommendationId,
        token: user.token,
      })
    ).filter(status => status.active)

    const isSpo = user.roles.includes(HMPPS_AUTH_ROLE.SPO)
    if (!isSpo) {
      const isPPDocumentCreated = statuses.find(status => status.name === STATUSES.PP_DOCUMENT_CREATED)

      if (!isPPDocumentCreated) {
        activate.push(STATUSES.PP_DOCUMENT_CREATED)

        const isSpoRecordedRationale = statuses.find(status => status.name === STATUSES.SPO_RECORDED_RATIONALE)
        if (!isSpo && isSpoRecordedRationale) {
          activate.push(STATUSES.CLOSED)
        }
      }
    }
    if (documentType === 'NO_RECALL_LETTER') {
      const isCompleted = statuses.find(status => status.name === STATUSES.COMPLETED)
      if (!isCompleted) {
        activate.push(STATUSES.COMPLETED)
      }
    }
    if (activate.length > 0) {
      await updateStatuses({
        recommendationId,
        token: user.token,
        activate,
        deActivate: [],
      })
    }

    const auditData = {
      crn: normalizedCrn,
      recommendationId,
      username: user.username,
      logErrors: isPreprodOrProd(res.locals.env) && process.env.NODE_ENV !== 'test',
    }
    if (documentType === 'PART_A') {
      auditService.createPartA(auditData)
      appInsightsEvent(
        EVENTS.PART_A_DOCUMENT_DOWNLOADED,
        user.username,
        { crn: normalizedCrn, recommendationId, region: user.region },
        flags
      )
    } else {
      auditService.createNoRecallLetter(auditData)
      appInsightsEvent(
        EVENTS.DECISION_NOT_TO_RECALL_LETTER_DOWNLOADED,
        user.username,
        {
          crn: normalizedCrn,
          recommendationId,
          region: user.region,
        },
        flags
      )
    }
  }
