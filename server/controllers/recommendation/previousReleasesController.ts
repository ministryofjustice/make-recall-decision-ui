import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { sharedPaths } from '../../routes/paths/shared.paths'
import { isDefined } from '../../utils/utils'
import validatePreviousReleases from '../recommendations/previousReleases/formValidator'
import { splitIsoDateToParts } from '../../utils/dates/conversion'
import { booleanToYesNo } from '../recommendations/formOptions/yesNo'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    user: { token },
    flags,
    errors,
    unsavedValues,
  } = res.locals

  const recommendation = await updateRecommendation({
    recommendationId,
    token,
    featureFlags: flags,
    propertyToRefresh: 'previousReleases',
  })

  res.locals = {
    ...res.locals,
    recommendation,
    page: {
      id: flags.flagFTR56Enabled ? 'releaseDetails' : 'previousReleases',
    },
  }

  if (!flags.flagFTR56Enabled) {
    if (errors) {
      res.locals.inputDisplayValues = {
        releaseUnderECSL: unsavedValues.releaseUnderECSL,
        dateOfRelease: unsavedValues.dateOfRelease,
        conditionalReleaseDate: unsavedValues.conditionalReleaseDate,
      }
    } else {
      res.locals.inputDisplayValues = {
        releaseUnderECSL: booleanToYesNo(recommendation.releaseUnderECSL),
        dateOfRelease: splitIsoDateToParts(recommendation.dateOfRelease),
        conditionalReleaseDate: splitIsoDateToParts(recommendation.conditionalReleaseDate),
      }
    }
  }

  if (flags.flagFTR56Enabled) {
    res.render('pages/recommendations/releaseDetails')
  } else {
    res.render(`pages/recommendations/previousReleases`)
  }
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  if (!flags.flagFTR56Enabled) {
    const { errors, valuesToSave, unsavedValues } = await validatePreviousReleases({
      requestBody: req.body,
      recommendationId,
      urlInfo,
      token,
    })

    if (errors) {
      req.session.errors = errors
      req.session.unsavedValues = unsavedValues
      return res.redirect(303, req.originalUrl)
    }

    await updateRecommendation({
      recommendationId,
      valuesToSave,
      token,
      featureFlags: flags,
    })
  } else {
    await updateRecommendation({
      recommendationId,
      valuesToSave: {
        previousReleases: {
          hasBeenReleasedPreviously: req.body.continueButton === '1',
        },
        dateOfRelease: req.body.dateOfRelease,
      },
      token,
      featureFlags: flags,
    })
  }

  let nextPagePath = `${sharedPaths.recommendations}/${recommendationId}/task-list#heading-person-details`

  if (!flags.flagFTR56Enabled) {
    const { deletePreviousReleaseDateIndex } = req.body
    if (isDefined(deletePreviousReleaseDateIndex)) {
      nextPagePath = `${sharedPaths.recommendations}/${recommendationId}/previous-releases`
    }
  }
  return res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
