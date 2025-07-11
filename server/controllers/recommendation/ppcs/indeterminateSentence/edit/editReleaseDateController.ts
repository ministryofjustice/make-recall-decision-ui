import { NextFunction, Request, Response } from 'express'
import { convertGmtDatePartsToUtc, dateHasError } from '../../../../../utils/dates/convert'
import { formatValidationErrorMessage, invalidDateInputPart, makeErrorObject } from '../../../../../utils/errors'
import { ValidationError } from '../../../../../@types/dates'
import { nextPageLinkUrl } from '../../../../recommendations/helpers/urls'
import { ppcsPaths } from '../../../../../routes/paths/ppcs'
import { RecommendationResponse } from '../../../../../@types/make-recall-decision-api'
import { updateRecommendation } from '../../../../../data/makeDecisionApiClient'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation, unsavedValues } = res.locals
  const recommendationResponse = recommendation as RecommendationResponse
  const ppudSentence = recommendationResponse.ppudOffender.sentences.find(
    s => s.id === recommendation.bookRecallToPpud.ppudSentenceId
  )
  const releaseDate = new Date(recommendationResponse.bookRecallToPpud.ppudSentenceData.releaseDate)

  res.locals = {
    ...res.locals,
    pageData: {
      existingReleaseDate: ppudSentence.releaseDate,
      day: unsavedValues?.day ?? releaseDate.getDate(),
      month: unsavedValues?.month ?? releaseDate.getMonth() + 1, // Apparently, months are index 0 -11
      year: unsavedValues?.year ?? releaseDate.getFullYear(),
    },
  }

  res.render('pages/recommendations/ppcs/indeterminateSentence/edit/editReleaseDate')
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { urlInfo, recommendation } = res.locals
  const { recommendationId } = req.params
  const { day, month, year } = req.body
  const releaseDateParts: { day: string; month: string; year: string } = {
    day: day !== '' ? day?.padStart(2, '0') : day,
    month: month !== '' ? month?.padStart(2, '0') : month,
    year: year !== '' ? year : year,
  }

  const releaseDate = convertGmtDatePartsToUtc(releaseDateParts as Record<string, string>, {
    includeTime: false,
    dateMustBeInFuture: true,
    validatePartLengths: true,
  })
  const errors = []

  if (dateHasError(releaseDate)) {
    const validationError = releaseDate as ValidationError
    errors.push(
      makeErrorObject({
        name: 'releaseDate',
        id: invalidDateInputPart(validationError, 'releaseDate'),
        text: formatValidationErrorMessage(validationError, 'release date'),
        errorId: validationError.errorId,
        invalidParts: validationError.invalidParts,
        values: releaseDateParts,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    req.session.unsavedValues = {
      day: Number(releaseDateParts.day),
      month: Number(releaseDateParts.month),
      year: Number(releaseDateParts.year),
    }
    return res.redirect(303, req.originalUrl)
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        ppudSentenceData: {
          ...recommendation.bookRecallToPpud.ppudSentenceData,
          releaseDate,
        },
      },
    },
    featureFlags: res.locals.flags,
    token: res.locals.user.token,
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: ppcsPaths.sentenceToCommitIndeterminate, urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
