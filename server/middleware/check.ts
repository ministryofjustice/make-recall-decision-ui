import { RequestHandler } from 'express'
import { RecommendationStatusResponse } from '../@types/make-recall-decision-api/models/RecommendationStatusReponse'
import { CUSTODY_GROUP } from '../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { RecommendationResponse } from '../@types/make-recall-decision-api'
import logger from '../../logger'

export type Check = (locals: Record<string, unknown>) => boolean

export function authorisationCheck(statusCheck?: Check): RequestHandler {
  return (req, res, next) => {
    if (statusCheck && !statusCheck(res.locals)) {
      logger.error(`User ${req.user?.username} is not authorised to access this: ${req.originalUrl}`)
      return res.redirect('/authError')
    }

    return next()
  }
}

export function statusIsActive(name: string): Check {
  return (locals: Record<string, unknown>) => {
    const statuses = locals.statuses as RecommendationStatusResponse[]
    return !!statuses.find(status => status.name === name && status.active)
  }
}

export function checkAllowedRole(name: string): RequestHandler {
  return authorisationCheck(hasRole(name))
}

export function hasRole(name: string): Check {
  return (locals: Record<string, unknown>) => {
    const user = locals.user as Record<string, unknown>
    const roles = user.roles as string[]
    return !!roles.find(role => role === name)
  }
}

export function flagIsActive(name: string): Check {
  return (locals: Record<string, unknown>) => {
    const flags = locals.flags as Record<string, boolean>
    return flags[name]
  }
}

export function ppcsCustodyGroup(custodyGroup: CUSTODY_GROUP): Check {
  return (locals: Record<string, unknown>) => {
    const recommendation = locals.recommendation as RecommendationResponse
    // In some cases there isn't a relevant recommendation available (e.g. in the offender
    // overview page), in which case we forego this check
    if (!recommendation) {
      return true
    }
    const recommendationCustodyGroup: CUSTODY_GROUP = recommendation.bookRecallToPpud?.custodyGroup
    return recommendationCustodyGroup !== undefined && recommendationCustodyGroup === custodyGroup
  }
}

export function not(check: Check): Check {
  return (locals: Record<string, unknown>) => {
    return !check(locals)
  }
}

export function or(...checks: Check[]): Check {
  return (locals: Record<string, unknown>) => {
    return checks.some(check => check(locals))
  }
}

export function and(...checks: Check[]): Check {
  return (locals: Record<string, unknown>) => {
    return checks.every(check => check(locals))
  }
}
