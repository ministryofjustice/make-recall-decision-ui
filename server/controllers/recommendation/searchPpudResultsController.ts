import { NextFunction, Request, Response } from 'express'
import { searchPpud } from '../../data/makeDecisionApiClient'

async function get(req: Request, res: Response, next: NextFunction) {
  const { user, recommendation } = res.locals

  const { results } = await searchPpud(
    user.token,
    recommendation.personOnProbation.croNumber,
    recommendation.personOnProbation.nomsNumber,
    recommendation.personOnProbation.surname,
    recommendation.personOnProbation.dateOfBirth
  )

  // if (results.length === 0) {
  //   const nextPagePath = nextPageLinkUrl({ nextPageId: 'no-search-ppud-results', urlInfo })
  //   res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
  //   return
  // }

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
