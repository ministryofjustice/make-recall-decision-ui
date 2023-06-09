import { Request, Response } from 'express'
import { validateCrn } from '../../utils/utils'
import { getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

async function get(req: Request, res: Response) {
  const { crn, recommendationId } = req.params
  const { user } = res.locals
  const normalizedCrn = validateCrn(crn)

  const statuses = (
    await getStatuses({
      recommendationId,
      token: user.token,
    })
  ).filter(status => status.active)

  const isClosed = statuses.find(status => status.name === STATUSES.CLOSED)
  const isPPDocumentCreated = statuses.find(status => status.name === STATUSES.PP_DOCUMENT_CREATED)

  if (!isClosed && isPPDocumentCreated) {
    await updateStatuses({
      recommendationId,
      token: user.token,
      activate: [STATUSES.CLOSED],
      deActivate: [],
    })
  }

  const pageUrlBase = `/cases/${normalizedCrn}/`
  return res.redirect(303, `${pageUrlBase}create-recommendation-warning`)
}

export default { get }
