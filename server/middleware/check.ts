import { RecommendationStatusResponse } from '../@types/make-recall-decision-api/models/RecommendationStatusReponse'

export type Check = (locals: Record<string, unknown>) => boolean

export function statusIsActive(name: string): Check {
  return (locals: Record<string, unknown>) => {
    const statuses = locals.statuses as RecommendationStatusResponse[]
    return !!statuses.find(status => status.name === name && status.active)
  }
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
