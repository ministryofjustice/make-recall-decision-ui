import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { updateRecommendation, searchPpud } from '../../data/makeDecisionApiClient'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    recommendation,
    urlInfo,
  } = res.locals

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
