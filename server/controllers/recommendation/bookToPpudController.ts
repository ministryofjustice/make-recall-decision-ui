import { NextFunction, Request, Response } from 'express'
import {
  getRecommendation,
  getSupportingDocuments,
  updateRecommendation,
  updateStatuses,
} from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import bookOffender from '../../booking/bookOffender'
import createOrUpdateSentence from '../../booking/createOrUpdateSentence'
import updateOffence from '../../booking/updateOffence'
import updateRelease from '../../booking/updateRelease'
import updateRecall from '../../booking/updateRecall'
import BookingMemento from '../../booking/BookingMemento'
import { StageEnum } from '../../booking/StageEnum'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import uploadMandatoryDocument from '../../booking/uploadMandatoryDocument'
import uploadAdditionalDocument from '../../booking/uploadAdditionalDocument'
import createMinute from '../../booking/createMinute'

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

  let memento: BookingMemento = recommendation.bookingMemento || {
    stage: StageEnum.STARTED,
  }

  await updateStatuses({
    recommendationId,
    token,
    activate: [STATUSES.BOOKING_ON_STARTED],
    deActivate: [],
  })

  try {
    memento = await bookOffender(memento, recommendation, token, flags)

    memento = await createOrUpdateSentence(memento, recommendation, token, flags)

    memento = await updateOffence(memento, recommendation, token, flags)

    memento = await updateRelease(memento, recommendation, token, flags)

    memento = await updateRecall(memento, recommendation, token, flags)

    const documents = await getSupportingDocuments({ recommendationId, token, featureFlags: flags })

    const PPUDPartA = documents.find(doc => doc.type === 'PPUDPartA')
    if (PPUDPartA) {
      memento = await uploadMandatoryDocument(memento, recommendationId, PPUDPartA?.id, 'PPUDPartA', token, flags)
    }

    const PPUDLicenceDocument = documents.find(doc => doc.type === 'PPUDLicenceDocument')
    if (PPUDLicenceDocument) {
      memento = await uploadMandatoryDocument(
        memento,
        recommendationId,
        PPUDLicenceDocument?.id,
        'PPUDLicenceDocument',
        token,
        flags
      )
    }

    const PPUDProbationEmail = documents.find(doc => doc.type === 'PPUDProbationEmail')
    if (PPUDProbationEmail) {
      memento = await uploadMandatoryDocument(
        memento,
        recommendationId,
        PPUDProbationEmail?.id,
        'PPUDProbationEmail',
        token,
        flags
      )
    }

    const PPUDOASys = documents.find(doc => doc.type === 'PPUDOASys')
    if (PPUDOASys) {
      memento = await uploadMandatoryDocument(memento, recommendationId, PPUDOASys?.id, 'PPUDOASys', token, flags)
    }

    const PPUDPrecons = documents.find(doc => doc.type === 'PPUDPrecons')
    if (PPUDPrecons) {
      memento = await uploadMandatoryDocument(memento, recommendationId, PPUDPrecons?.id, 'PPUDPrecons', token, flags)
    }

    const PPUDPSR = documents.find(doc => doc.type === 'PPUDPSR')
    if (PPUDPSR) {
      memento = await uploadMandatoryDocument(memento, recommendationId, PPUDPSR?.id, 'PPUDPSR', token, flags)
    }

    const PPUDChargeSheet = documents.find(doc => doc.type === 'PPUDChargeSheet')
    if (PPUDChargeSheet) {
      memento = await uploadMandatoryDocument(
        memento,
        recommendationId,
        PPUDChargeSheet?.id,
        'PPUDChargeSheet',
        token,
        flags
      )
    }

    const additional = documents.filter(doc => doc.type === 'OtherDocument').map(d => d.id)

    for (const id of additional) {
      memento = await uploadAdditionalDocument(memento, recommendationId, id, token, flags)
    }

    if (recommendation.bookRecallToPpud?.minute) {
      memento = await createMinute(
        memento,
        recommendationId,
        'Notes regarding documents added from Consider a Recall',
        recommendation.bookRecallToPpud?.minute,
        token,
        flags
      )
    }

    await updateStatuses({
      recommendationId,
      token,
      activate: [STATUSES.BOOKED_TO_PPUD, STATUSES.REC_CLOSED],
      deActivate: [],
    })
  } catch (err) {
    if (err.status !== undefined) {
      memento.failed = true
      memento.failedMessage = err.text

      await updateRecommendation({
        recommendationId: String(recommendation.id),
        valuesToSave: {
          bookingMemento: memento,
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
