import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { ppudDetails, searchPpud, updateRecommendation } from '../../data/makeDecisionApiClient'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'

async function get(req: Request, res: Response, next: NextFunction) {
  const pageUrlSlug = 'no-ppud-search-results'
  const {
    flags,
    user: { username, region, token },
    recommendation,
    urlInfo,
  } = res.locals
  const { crn } = recommendation
  const { results } = await searchPpud(
    token,
    recommendation.personOnProbation.croNumber,
    recommendation.personOnProbation.nomsNumber,
    recommendation.personOnProbation.surname,
    recommendation.personOnProbation.dateOfBirth
  )

  if (results.length === 0) {
    res.locals = {
      ...res.locals,
      page: {
        id: 'noSearchPpudResults',
      },
      results,
    }
    appInsightsEvent(
      EVENTS.MRD_NO_PPUD_SEARCH_RESULTS,
      username,
      {
        crn,
        pageUrlSlug,
        region,
      },
      flags
    )
    const name = recommendation.personOnProbation.fullName.replace(/\s/g, '%20') as string
    const nextPagePath = `${nextPageLinkUrl({ nextPageId: 'no-search-ppud-results', urlInfo })}?fullName=${name}`
    res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
    return
  }
  res.locals = {
    ...res.locals,
    page: {
      id: 'searchPpudResults',
    },
    results,
  }
  res.render(`pages/recommendations/searchPpudResults`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { id } = req.body

  const {
    user: { token },
    urlInfo,
    flags,
  } = res.locals

  const details = await ppudDetails(token, id)

  await updateRecommendation({
    recommendationId: String(recommendationId),
    valuesToSave: {
      ppudOffender: details.offender,
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'check-booking-details', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
