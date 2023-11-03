import { NextFunction, Request, Response, Router } from 'express'
import recommendationStatusCheck from '../middleware/recommendationStatusCheck'
import sanitizeInputValues from '../controllers/sanitizeInputValues'
import { parseRecommendationUrl } from '../middleware/parseRecommendationUrl'
import retrieveRecommendation from '../controllers/retrieveRecommendation'
import { guardAgainstModifyingClosedRecommendation } from '../middleware/guardAgainstModifyingClosedRecommendation'
import customizeMessages from '../controllers/customizeMessages'
import audit from '../controllers/audit'
import retrieveStatuses from '../controllers/retrieveStatuses'
import { authorisationCheck } from '../middleware/authorisationCheck'
import { Check } from '../middleware/check'

type RouterCallback = (req: Request, res: Response, next: NextFunction) => void

export class RouteBuilder {
  private router: Router

  private rolesCheck?: Check

  private statusCheck?: Check

  constructor(router: Router, statusCheck?: Check, roles?: Check) {
    this.router = router
    this.rolesCheck = roles
    this.statusCheck = statusCheck
  }

  public withRoles(rolesCheck: Check): RouteBuilder {
    return new RouteBuilder(this.router, this.statusCheck, rolesCheck)
  }

  public withCheck(statusCheck: Check): RouteBuilder {
    return new RouteBuilder(this.router, statusCheck, this.rolesCheck)
  }

  public get(endpoint: string, routerCallback: RouterCallback): void {
    this.router.get(
      `/:recommendationId/${endpoint}`,
      // authorisationMiddleware,
      feedErrorsToExpress(retrieveStatuses),
      authorisationCheck(this.rolesCheck),
      recommendationStatusCheck(this.statusCheck),
      sanitizeInputValues,
      parseRecommendationUrl,
      feedErrorsToExpress(retrieveRecommendation),
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
      feedErrorsToExpress(retrieveStatuses),
      authorisationCheck(this.rolesCheck),
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
