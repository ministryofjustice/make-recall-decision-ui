import { NextFunction, Request, Response, Router } from 'express'
import authorisationMiddleware, { HMPPS_AUTH_ROLE } from '../middleware/authorisationMiddleware'
import recommendationStatusCheck, { StatusCheck } from '../middleware/recommendationStatusCheck'
import sanitizeInputValues from '../controllers/sanitizeInputValues'
import { parseRecommendationUrl } from '../middleware/parseRecommendationUrl'
import retrieve from '../controllers/retrieveRecommendation'
import { guardAgainstModifyingClosedRecommendation } from '../middleware/guardAgainstModifyingClosedRecommendation'
import customizeMessages from '../controllers/customizeMessages'
import audit from '../controllers/audit'
import handleMaintenanceBanner from '../middleware/maintenanceHandler'

type RouterCallback = (req: Request, res: Response, next: NextFunction) => void

export class RouteBuilder {
  private router: Router

  private roles: string[]

  private statusCheck?: StatusCheck

  constructor(router: Router, statusCheck?: StatusCheck, roles: string[] = [HMPPS_AUTH_ROLE.PO]) {
    this.router = router
    this.roles = roles
    this.statusCheck = statusCheck
  }

  public withRoles(roles: string[]): RouteBuilder {
    return new RouteBuilder(this.router, this.statusCheck, roles)
  }

  public withCheck(statusCheck: StatusCheck): RouteBuilder {
    return new RouteBuilder(this.router, statusCheck, this.roles)
  }

  public get(endpoint: string, routerCallback: RouterCallback): void {
    this.router.get(
      `/:recommendationId/${endpoint}`,
      handleMaintenanceBanner,
      feedErrorsToExpress(authorisationMiddleware(this.roles)),
      feedErrorsToExpress(recommendationStatusCheck(this.statusCheck)),
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

  public post(endpoint: string, routerCallback: RouterCallback) {
    this.router.post(
      `/:recommendationId/${endpoint}`,
      feedErrorsToExpress(authorisationMiddleware(this.roles)),
      feedErrorsToExpress(recommendationStatusCheck(this.statusCheck)),
      sanitizeInputValues,
      parseRecommendationUrl,
      feedErrorsToExpress(routerCallback), // necessary for async functions
      (error: Error, req: Request, res: Response, next: NextFunction): void => {
        next(error) // forward errors to root router
      }
    )
  }

  static build(router: Router) {
    return new RouteBuilder(router)
  }
}

function feedErrorsToExpress(routerCallback: RouterCallback) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await routerCallback(req, res, next)
    } catch (err) {
      return next(err)
    }
  }
}
