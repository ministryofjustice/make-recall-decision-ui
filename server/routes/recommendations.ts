import { NextFunction, Request, RequestHandler, Response, Router } from 'express'
import { parseRecommendationUrl } from '../middleware/parseRecommendationUrl'
import taskListConsiderRecallController from '../controllers/recommendation/taskListConsiderRecallController'
import { createRecommendationController } from '../controllers/recommendations/createRecommendation'
import { createAndDownloadDocument } from '../controllers/recommendations/createAndDownloadDocument'
import { updateRecommendationStatus } from '../controllers/recommendations/updateRecommendationStatus'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { getRecommendationPage } from '../controllers/recommendations/getRecommendationPage'
import { postRecommendationForm } from '../controllers/recommendations/postRecommendationForm'
import audit from '../controllers/audit'
import retrieve from '../controllers/retrieveRecommendation'
import responseToProbationController from '../controllers/recommendation/responseToProbationController'
import licenceConditionsController from '../controllers/recommendation/licenceConditionsController'
import alternativesToRecallTriedController from '../controllers/recommendation/alternativesToRecallTriedController'
import triggerLeadingToRecallController from '../controllers/recommendation/triggerLeadingToRecallController'
import isIndeterminateController from '../controllers/recommendation/isIndeterminateController'
import isExtendedController from '../controllers/recommendation/isExtendedController'

import indeterminateTypeController from '../controllers/recommendation/indeterminateTypeController'
import customizeMessages from '../controllers/customizeMessages'
import shareManagerController from '../controllers/recommendation/shareManagerController'
import sanitizeInputValues from '../controllers/sanitizeInputValues'
import discussWithManagerController from '../controllers/recommendation/discussWithManagerController'
import recallTypeController from '../controllers/recommendation/recallTypeController'
import recallTypeIndeterminateController from '../controllers/recommendation/recallTypeIndeterminateController'
import redirectController from '../controllers/recommendation/redirectController'
import { guardAgainstModifyingClosedRecommendation } from '../middleware/guardAgainstModifyingClosedRecommendation'
import spoTaskListConsiderRecallController from '../controllers/recommendation/spoTaskListConsiderRecallController'
import authorisationMiddleware, { HMPPS_AUTH_ROLE } from '../middleware/authorisationMiddleware'
import reviewPractitionersConcernsController from '../controllers/recommendation/reviewPractitionersConcernsController'
import caseSummaryController from '../controllers/caseSummary/caseSummaryController'
import spoRecallRationaleController from '../controllers/recommendation/spoRecallRationaleController'
import spoRecordDecisionController from '../controllers/recommendation/spoRecordDecisionController'
import spoRationaleConfirmationController from '../controllers/recommendation/spoRationaleConfirmationController'
import taskListNoRecallController from '../controllers/recommendation/taskListNoRecallController'
import taskListController from '../controllers/recommendation/taskListController'
import previewNoRecallLetterController from '../controllers/recommendation/previewNoRecallLetterController'
import confirmationNoRecallController from '../controllers/recommendation/confirmationNoRecallController'
import whyConsideredRecallController from '../controllers/recommendation/whyConsideredRecallController'
import reasonsNoRecallController from '../controllers/recommendation/reasonsNoRecallController'
import appointmentNoRecallController from '../controllers/recommendation/appointmentNoRecallController'
import managerReviewController from '../controllers/recommendation/managerReviewController'
import recommendationStatusCheck, {
  and,
  not,
  or,
  roleIsActive,
  StatusCheck,
  STATUSES,
  statusIsActive,
} from '../middleware/recommendationStatusCheck'
import sensitiveInfoController from '../controllers/recommendation/sensitiveInfoController'
import custodyStatusController from '../controllers/recommendation/custodyStatusController'
import whatLedController from '../controllers/recommendation/whatLedController'
import { saveErrorWithDetails } from '../utils/errors'
import logger from '../../logger'
import requestSpoCountersignController from '../controllers/recommendation/requestSpoCountersignController'
import emergencyRecallController from '../controllers/recommendation/emergencyRecallController'
import personalDetailsController from '../controllers/recommendation/personalDetailsController'
import offenceDetailsController from '../controllers/recommendation/offenceDetailsController'
import mappaController from '../controllers/recommendation/mappaController'
import managerViewDecisionController from '../controllers/recommendation/managerViewDecisionController'
import managerDecisionConfirmationController from '../controllers/recommendation/managerDecisionConfirmationController'
import countersigningTelephoneController from '../controllers/recommendation/countersigningTelephoneController'
import managerCountersignatureController from '../controllers/recommendation/managerCountersignatureController'
import requestAcoCountersignController from '../controllers/recommendation/requestAcoCountersignController'
import countersignConfirmationController from '../controllers/recommendation/countersignConfirmationController'
import rationaleCheckController from '../controllers/recommendation/rationaleCheckController'

const recommendations = Router()

routeRecommendationGet('', redirectController.get, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet(
  'spo-task-list-consider-recall',
  spoTaskListConsiderRecallController.get,
  [HMPPS_AUTH_ROLE.SPO],
  or(statusIsActive(STATUSES.SPO_CONSIDER_RECALL), statusIsActive(STATUSES.SPO_CONSIDERING_RECALL))
)

routeRecommendationGet(
  `review-case/:crn/:sectionId`,
  caseSummaryController.get,
  [HMPPS_AUTH_ROLE.SPO],
  statusIsActive(STATUSES.SPO_CONSIDERING_RECALL)
)
routeRecommendationPost(`review-case/:crn/:sectionId`, caseSummaryController.post, [HMPPS_AUTH_ROLE.SPO])

routeRecommendationGet(
  'review-practitioners-concerns',
  reviewPractitionersConcernsController.get,
  [HMPPS_AUTH_ROLE.SPO],
  statusIsActive(STATUSES.SPO_CONSIDERING_RECALL)
)
routeRecommendationPost('review-practitioners-concerns', reviewPractitionersConcernsController.post, [
  HMPPS_AUTH_ROLE.SPO,
])

routeRecommendationGet(
  'spo-rationale',
  spoRecallRationaleController.get,
  [HMPPS_AUTH_ROLE.SPO],
  statusIsActive(STATUSES.SPO_CONSIDERING_RECALL)
)
routeRecommendationPost('spo-rationale', spoRecallRationaleController.post, [HMPPS_AUTH_ROLE.SPO])

routeRecommendationGet('spo-rationale-confirmation', spoRationaleConfirmationController.get, [HMPPS_AUTH_ROLE.SPO])

routeRecommendationGet(
  'spo-record-decision',
  spoRecordDecisionController.get,
  [HMPPS_AUTH_ROLE.SPO],
  statusIsActive(STATUSES.SPO_CONSIDERING_RECALL)
)
routeRecommendationPost('spo-record-decision', spoRecordDecisionController.post, [HMPPS_AUTH_ROLE.SPO])

routeRecommendationGet('task-list-consider-recall', taskListConsiderRecallController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('task-list-consider-recall', taskListConsiderRecallController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('trigger-leading-to-recall', triggerLeadingToRecallController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('trigger-leading-to-recall', triggerLeadingToRecallController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('response-to-probation', responseToProbationController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('response-to-probation', responseToProbationController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('licence-conditions', licenceConditionsController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('licence-conditions', licenceConditionsController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('alternatives-tried', alternativesToRecallTriedController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('alternatives-tried', alternativesToRecallTriedController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('indeterminate-type', indeterminateTypeController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('indeterminate-type', indeterminateTypeController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('is-indeterminate', isIndeterminateController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('is-indeterminate', isIndeterminateController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('is-extended', isExtendedController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('is-extended', isExtendedController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('share-case-with-manager', shareManagerController.get, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('sensitive-info', sensitiveInfoController.get, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('custody-status', custodyStatusController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('custody-status', custodyStatusController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('what-led', whatLedController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('what-led', whatLedController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('discuss-with-manager', discussWithManagerController.get, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('recall-type', recallTypeController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('recall-type', recallTypeController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('recall-type-indeterminate', recallTypeIndeterminateController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('recall-type-indeterminate', recallTypeIndeterminateController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('task-list-no-recall', taskListNoRecallController.get, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('why-considered-recall', whyConsideredRecallController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('why-considered-recall', whyConsideredRecallController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('reasons-no-recall', reasonsNoRecallController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('reasons-no-recall', reasonsNoRecallController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('appointment-no-recall', appointmentNoRecallController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('appointment-no-recall', appointmentNoRecallController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet(
  'rationale-check',
  rationaleCheckController.get,
  [HMPPS_AUTH_ROLE.SPO],
  statusIsActive(STATUSES.SPO_SIGNATURE_REQUESTED)
)
routeRecommendationPost('rationale-check', rationaleCheckController.post, [HMPPS_AUTH_ROLE.SPO])

routeRecommendationGet(
  'task-list',
  taskListController.get,
  [HMPPS_AUTH_ROLE.PO, HMPPS_AUTH_ROLE.SPO],
  or(
    not(roleIsActive(HMPPS_AUTH_ROLE.SPO)),
    and(
      roleIsActive(HMPPS_AUTH_ROLE.SPO),
      or(
        statusIsActive(STATUSES.SPO_SIGNATURE_REQUESTED),
        statusIsActive(STATUSES.SPO_SIGNED),
        statusIsActive(STATUSES.ACO_SIGNATURE_REQUESTED),
        statusIsActive(STATUSES.ACO_SIGNED)
      )
    )
  )
)

routeRecommendationGet('preview-no-recall', previewNoRecallLetterController.get, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('confirmation-no-recall', confirmationNoRecallController.get, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('manager-review', managerReviewController.get, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet(
  'request-spo-countersign',
  requestSpoCountersignController.get,
  [HMPPS_AUTH_ROLE.PO],
  not(statusIsActive(STATUSES.SPO_SIGNED))
)

routeRecommendationGet(
  'request-aco-countersign',
  requestAcoCountersignController.get,
  [HMPPS_AUTH_ROLE.PO],
  and(statusIsActive(STATUSES.SPO_SIGNED), not(statusIsActive(STATUSES.ACO_SIGNED)))
)

routeRecommendationGet('emergency-recall', emergencyRecallController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('emergency-recall', emergencyRecallController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('personal-details', personalDetailsController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationGet('offence-details', offenceDetailsController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationGet('mappa', mappaController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationGet('manager-view-decision', managerViewDecisionController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationGet('manager-decision-confirmation', managerDecisionConfirmationController.get, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet(
  'countersigning-telephone',
  countersigningTelephoneController.get,
  [HMPPS_AUTH_ROLE.SPO],
  or(statusIsActive(STATUSES.SPO_SIGNATURE_REQUESTED), statusIsActive(STATUSES.ACO_SIGNATURE_REQUESTED))
)
routeRecommendationPost('countersigning-telephone', countersigningTelephoneController.post, [HMPPS_AUTH_ROLE.SPO])

routeRecommendationGet(
  'manager-countersignature',
  managerCountersignatureController.get,
  [HMPPS_AUTH_ROLE.SPO],
  or(statusIsActive(STATUSES.SPO_SIGNATURE_REQUESTED), statusIsActive(STATUSES.ACO_SIGNATURE_REQUESTED))
)
routeRecommendationPost('manager-countersignature', managerCountersignatureController.post, [HMPPS_AUTH_ROLE.SPO])

routeRecommendationGet(
  'countersign-confirmation',
  countersignConfirmationController.get,
  [HMPPS_AUTH_ROLE.SPO],
  or(statusIsActive(STATUSES.SPO_SIGNED), statusIsActive(STATUSES.ACO_SIGNED))
)

const get = (path: string, handler: RequestHandler) => recommendations.get(path, asyncMiddleware(handler))
const post = (path: string, handler: RequestHandler) => recommendations.post(path, asyncMiddleware(handler))
post('', createRecommendationController)
get(`/:recommendationId/documents/part-a`, createAndDownloadDocument('PART_A'))
get(`/:recommendationId/documents/no-recall-letter`, createAndDownloadDocument('NO_RECALL_LETTER'))
post(`/:recommendationId/status`, updateRecommendationStatus)

recommendations.get(`/:recommendationId/:pageUrlSlug`, parseRecommendationUrl, asyncMiddleware(getRecommendationPage))
recommendations.post(`/:recommendationId/:pageUrlSlug`, parseRecommendationUrl, asyncMiddleware(postRecommendationForm))

export default recommendations

type RouterCallback = (req: Request, res: Response, next: NextFunction) => void

function routeRecommendationGet(
  endpoint: string,
  routerCallback: RouterCallback,
  roles: string[],
  statusCheck?: StatusCheck
) {
  recommendations.get(
    `/:recommendationId/${endpoint}`,
    feedErrorsToExpress(authorisationMiddleware(roles)),
    feedErrorsToExpress(recommendationStatusCheck(statusCheck)),
    sanitizeInputValues,
    parseRecommendationUrl,
    feedErrorsToExpress(retrieve), // necessary for async functions
    guardAgainstModifyingClosedRecommendation,
    customizeMessages,
    feedErrorsToExpress(routerCallback), // necessary for async functions
    audit,
    (error: Error, req: Request, res: Response, next: NextFunction): void => {
      next(error) // forward errors to root router
    }
  )
}

function routeRecommendationPost(endpoint: string, routerCallback: RouterCallback, roles: string[]) {
  recommendations.post(
    `/:recommendationId/${endpoint}`,
    authorisationMiddleware(roles),
    sanitizeInputValues,
    parseRecommendationUrl,
    feedErrorsToExpress(routerCallback), // necessary for async functions
    (error: Error, req: Request, res: Response, next: NextFunction): void => {
      next(error) // forward errors to root router
    }
  )
}

function feedErrorsToExpress(routerCallback: RouterCallback) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await routerCallback(req, res, next)
    } catch (err) {
      if (err.name === 'AppError') {
        next(err)
      }
      logger.error(err)
      req.session.errors = [saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' })]
      return res.redirect(303, req.originalUrl)
    }
  }
}
