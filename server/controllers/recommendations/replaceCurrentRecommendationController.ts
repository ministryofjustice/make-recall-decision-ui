import { Request, Response } from 'express'
import { validateCrn } from '../../utils/utils'
import { updateStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

async function get(req: Request, res: Response) {
  const { crn, recommendationId } = req.params
  const { user } = res.locals
  const normalizedCrn = validateCrn(crn)

  // This controller is responsible for closing the rec doc when a PP needs to open a new one, and the SPO rationale has not been supplied (no ppcs flag)

  // This process is incompatible with sending to PPCS, case summary never routes here if active rec doc is with PPCS and we close rec docs at the end of booking on regardless of spo rationale.

  await updateStatuses({
    recommendationId,
    token: user.token,
    activate: [STATUSES.REC_CLOSED],
    deActivate: [],
  })

  const pageUrlBase = `/cases/${normalizedCrn}/`
  return res.redirect(303, `${pageUrlBase}create-recommendation-warning`)
}

export default { get }
