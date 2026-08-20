import { NextFunction, Request, Response } from 'express'
import { RecommendationResponse } from '../../../../@types/make-recall-decision-api'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'
import { getSupportingDocuments } from '../../../../data/makeDecisionApiClient'
import { riskOfSeriousHarmLevel } from '../../../recommendations/helpers/rosh'
import { SentenceGroup } from '../../../recommendations/sentenceInformation/formOptions'

async function get(req: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    user: { token },
    flags,
  } = res.locals

  const recommendationResponse = recommendation as RecommendationResponse

  const offence = recommendationResponse.nomisIndexOffence.allOptions.find(
    o => o.offenderChargeId === recommendation.nomisIndexOffence.selected,
  )

  const documents = await getSupportingDocuments({
    recommendationId: String(recommendation.id),
    token,
    featureFlags: flags,
  })

  const extended = recommendationResponse.sentenceGroup === SentenceGroup.EXTENDED ? 'Yes' : 'No'
  const custody =
    recommendationResponse.prisonOffender?.status === 'ACTIVE IN'
      ? `Yes at ${recommendationResponse.prisonOffender?.locationDescription || 'HMP Prison'}`
      : 'No'
  const rosh = riskOfSeriousHarmLevel(recommendationResponse.currentRoshForPartA)
  const sentencingCourt = offence?.courtDescription || ''

  const backgroundInfo =
    `Extended sentence: ${extended}\n` +
    `Risk of serious harm level: ${rosh}\n` +
    `In custody: ${custody}\n` +
    `Sentencing court: ${sentencingCourt}`

  const moreInfo = recommendationResponse.bookRecallToPpud?.minute

  res.locals = {
    ...res.locals,
    page: {
      id: 'sentenceToCommit',
    },
    offence,
    documents,
    backgroundInfo,
    moreInfo,
  }

  res.render(`pages/recommendations/ppcs/sentenceToCommit/sentenceToCommit`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { urlInfo } = res.locals

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'book-to-ppud', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
