import { NextFunction, Request, Response } from 'express'
import { getRecommendation, updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import bookOffender from '../../booking/bookOffender'
import updateSentence from '../../booking/updateSentence'
import updateOffence from '../../booking/updateOffence'
import updateRelease from '../../booking/updateRelease'
import updateRecall from '../../booking/updateRecall'
import BookingMomento from '../../booking/BookingMomento'
import { StageEnum } from '../../booking/StageEnum'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

async function get(req: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'bookToPpud',
    },
  }

  res.render(`pages/recommendations/bookToPpud`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    user: { token, username, region },
    urlInfo,
    flags,
  } = res.locals

  const recommendation = (await getRecommendation(recommendationId, token)) as RecommendationResponse

  let momento: BookingMomento = recommendation.bookingMomento || {
    stage: StageEnum.STARTED,
  }

  try {
    momento = await bookOffender(momento, recommendation, token, flags)

    momento = await updateSentence(momento, recommendation, token, flags)

    momento = await updateOffence(momento, recommendation, token, flags)

    momento = await updateRelease(momento, recommendation, token, flags)

    momento = await updateRecall(momento, recommendation, token, flags)

    await updateStatuses({
      recommendationId,
      token,
      activate: [STATUSES.BOOKED_TO_PPUD, STATUSES.REC_CLOSED],
      deActivate: [],
    })
  } catch (err) {
    if (err.status !== undefined) {
      momento.failed = true
      momento.failedMessage = err.text

      await updateRecommendation({
        recommendationId: String(recommendation.id),
        valuesToSave: {
          bookingMomento: momento,
        },
        token,
        featureFlags: flags,
      })

      appInsightsEvent(
        EVENTS.BOOKING_ERROR,
        username,
        {
          crn: recommendation.crn,
          recommendationId,
          region,
        },
        flags
      )

      return res.redirect(303, req.originalUrl)
    }
    throw err
  }

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'booked-to-ppud', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
