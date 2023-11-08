import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { searchPpud } from '../../data/makeDecisionApiClient'

async function get(req: Request, res: Response, next: NextFunction) {
  const { user, recommendation } = res.locals

  // this is likely to be a very expensive call, which is why we have the spinner page.

  const response = await searchPpud(
    user.token,
    recommendation.personOnProbation.croNumber,
    recommendation.personOnProbation.nomsNumber,
    recommendation.personOnProbation.surname,
    recommendation.personOnProbation.dateOfBirth
  )

  let ppud = null
  if (response.results.length) {
    ;[ppud] = response.results
  } // later we will add in redirects to alternative no details in ppud page.

  res.locals = {
    ...res.locals,
    page: {
      id: 'bookInPpud',
    },
    ppud,
  }
  res.render(`pages/recommendations/bookInPpud`)
  next()
}

async function post(_: Request, res: Response, next: NextFunction) {
  // book in ppud.
  const { urlInfo } = res.locals

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'xyz', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))

  next()
}

export default { get, post }
