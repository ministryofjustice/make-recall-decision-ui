import { Request, Response } from 'express'
import { createDocument, getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'
import { isPreprodOrProd, validateCrn } from '../../utils/utils'
import { AuditService } from '../../services/auditService'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { DOCUMENT_TYPE } from '../../@types/make-recall-decision-api/models/DocumentType'

const auditService = new AuditService()

export const createAndDownloadDocument =
  (documentType: DOCUMENT_TYPE) =>
  async (req: Request, res: Response): Promise<Response | void> => {
    const { recommendationId } = req.params
    const { crn } = req.query
    const normalizedCrn = validateCrn(crn)
    const { user, flags } = res.locals
    let pathSuffix = 'no-recall-letter'
    let preview = false
    const requestBody: Record<string, unknown> = {
      format: 'download-docx',
    }
    if (documentType === DOCUMENT_TYPE.PART_A) {
      pathSuffix = 'part-a'
      requestBody.userEmail = user.email
    }
    if (documentType === DOCUMENT_TYPE.PREVIEW_PART_A) {
      pathSuffix = 'part-a'
      requestBody.userEmail = user.email
      preview = true
    }
    const { fileName, fileContents } = await createDocument(
      recommendationId,
      pathSuffix,
      requestBody,
      user.token,
      flags,
      preview
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

    if ([DOCUMENT_TYPE.PART_A, DOCUMENT_TYPE.NO_RECALL_LETTER].includes(documentType)) {
      const isPPDocumentCreated = statuses.find(status => status.name === STATUSES.PP_DOCUMENT_CREATED)

      if (!isPPDocumentCreated) {
        activate.push(STATUSES.PP_DOCUMENT_CREATED)
        const isSpoRecordedRationale = statuses.find(status => status.name === STATUSES.SPO_RECORDED_RATIONALE)
        const isApRecordedRationale = statuses.find(status => status.name === STATUSES.AP_RECORDED_RATIONALE)
        if (isSpoRecordedRationale || isApRecordedRationale) {
          if (documentType === DOCUMENT_TYPE.PART_A) {
            activate.push(STATUSES.SENT_TO_PPCS)
          }
        }
      }
    }
    if (documentType === DOCUMENT_TYPE.NO_RECALL_LETTER) {
      const isRecClosed = statuses.find(status => status.name === STATUSES.REC_CLOSED)
      if (!isRecClosed) {
        activate.push(STATUSES.REC_CLOSED)
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
    if (documentType === DOCUMENT_TYPE.PART_A) {
      await auditService.createPartA(auditData)
      appInsightsEvent(
        EVENTS.PART_A_DOCUMENT_DOWNLOADED,
        user.username,
        { crn: normalizedCrn, recommendationId, region: user.region },
        flags
      )
    } else if (documentType === DOCUMENT_TYPE.NO_RECALL_LETTER) {
      await auditService.createNoRecallLetter(auditData)
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
