import { NextFunction, Request, Response } from 'express'
import { searchPpud } from '../../data/makeDecisionApiClient'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { sharedPaths } from '../../routes/paths/shared.paths'

async function get(_: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'searchPpud',
    },
  }
  res.render(`pages/recommendations/searchPpud`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { crn, croNumber, nomsNumber, surname, dateOfBirth, fullName } = req.body
  const {
    user: { username, region, token },
    urlInfo,
    flags,
  } = res.locals

  const { results } = await searchPpud(token, croNumber, nomsNumber, surname, dateOfBirth)

  if (results.length === 0) {
    appInsightsEvent(
      EVENTS.MRD_NO_PPUD_SEARCH_RESULTS,
      username,
      {
        crn,
        pageUrlSlug: 'no-ppud-search-results',
        region,
      },
      flags
    )

    req.session.fullName = fullName.replace(/\s/g, ' ') as string
    req.session.crn = crn
    const nextPagePath = `${nextPageLinkUrl({ nextPageId: 'no-search-ppud-results', urlInfo })}`
    res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
    return
  }

  req.session.ppudSearchResults = results

  const nextPagePath = `${sharedPaths.recommendations}/${recommendationId}/search-ppud-results`
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
