import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { updateRecommendation, searchPpud } from '../../data/makeDecisionApiClient'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
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
  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      ppudRecordPresent: results.length > 0,
    },
    token,
    featureFlags: flags,
  })

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

export default { get }
