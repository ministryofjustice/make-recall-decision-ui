import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'
import { riskOfSeriousHarmLevel } from '../recommendations/helpers/rosh'
import getRoute from './ppcs/custodyGroupRouter'

const formatMinute = (recommendation: RecommendationResponse) => {
  const savedMinute = recommendation.bookRecallToPpud?.minute

  if (savedMinute) {
    return savedMinute
  }

  const offence = recommendation?.nomisIndexOffence?.allOptions?.find(
    option => option.offenderChargeId === recommendation.nomisIndexOffence.selected,
  )

  const extended = recommendation.sentenceGroup === SentenceGroup.EXTENDED ? 'Yes' : 'No'

  const custody =
    recommendation.prisonOffender?.status === 'ACTIVE IN'
      ? `Yes (at ${recommendation.prisonOffender.locationDescription || 'HMP Prison'})`
      : 'No'

  const rosh = riskOfSeriousHarmLevel(recommendation.currentRoshForPartA)

  const sentencingCourt = offence?.courtDescription || ''

  return `Background information
All mandatory documents received
Extended sentence: ${extended}
Risk of serious harm level: ${rosh}
In custody: ${custody}
Sentencing court: ${sentencingCourt}

More information
`
}

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const minute = formatMinute(recommendation as RecommendationResponse)

  res.locals = {
    ...res.locals,
    minute,
    page: {
      id: 'addMinute',
    },
  }

  res.render('pages/recommendations/addMinute')
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { minute } = req.body

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const recommendation = await getRecommendation(recommendationId, token)

  await updateRecommendation({
    recommendationId: String(recommendation.id),
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        minute,
      },
    },
    token,
    featureFlags: flags,
  })
  const nextPageId = getRoute(recommendation.bookRecallToPpud.custodyGroup)
  const nextPagePath = nextPageLinkUrl({ nextPageId, urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
