import { NextFunction, Request, Response } from 'express'
import { convertGmtDatePartsToUtc, dateHasError } from '../../../../../utils/dates/conversion'
import { formatValidationErrorMessage, invalidDateInputPart, makeErrorObject } from '../../../../../utils/errors'
import { ValidationError } from '../../../../../@types/dates'
import { nextPageLinkUrl } from '../../../../recommendations/helpers/urls'
import { ppcsPaths } from '../../../../../routes/paths/ppcs.routes'
import { RecommendationResponse } from '../../../../../@types/make-recall-decision-api'
import { updateRecommendation } from '../../../../../data/makeDecisionApiClient'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation, unsavedValues } = res.locals
  const recommendationResponse = recommendation as RecommendationResponse
  const ppudSentence = recommendationResponse.ppudOffender.sentences.find(
    s => s.id === recommendation.bookRecallToPpud.ppudSentenceId
  )
  const dateOfSentence = new Date(recommendationResponse.bookRecallToPpud.ppudIndeterminateSentenceData.dateOfSentence)

  res.locals = {
    ...res.locals,
    pageData: {
      existingDateOfSentence: ppudSentence.dateOfSentence,
      day: unsavedValues?.day ?? dateOfSentence.getDate(),
      month: unsavedValues?.month ?? dateOfSentence.getMonth() + 1, // Apparently, months are index 0 - 11
      year: unsavedValues?.year ?? dateOfSentence.getFullYear(),
    },
  }

  res.render('pages/recommendations/ppcs/indeterminateSentence/edit/editDateOfSentence')
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { urlInfo, recommendation } = res.locals
  const { recommendationId } = req.params
  const { day, month, year } = req.body
  const dateOfSentenceParts: { day: string; month: string; year: string } = {
    day: day !== '' ? day?.padStart(2, '0') : day,
    month: month !== '' ? month?.padStart(2, '0') : month,
    year: year !== '' ? year : year,
  }

  const dateOfSentence = convertGmtDatePartsToUtc(dateOfSentenceParts as Record<string, string>, {
    includeTime: false,
    dateMustBeInPast: true,
    validatePartLengths: true,
  })
  const errors = []

  if (dateHasError(dateOfSentence)) {
    const validationError = dateOfSentence as ValidationError
    errors.push(
      makeErrorObject({
        name: 'dateOfSentence',
        id: invalidDateInputPart(validationError, 'dateOfSentence'),
        text: formatValidationErrorMessage(validationError, 'date of sentence'),
        errorId: validationError.errorId,
        invalidParts: validationError.invalidParts,
        values: dateOfSentenceParts,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    req.session.unsavedValues = {
      day: Number(dateOfSentenceParts.day),
      month: Number(dateOfSentenceParts.month),
      year: Number(dateOfSentenceParts.year),
    }
    return res.redirect(303, req.originalUrl)
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        ppudIndeterminateSentenceData: {
          ...recommendation.bookRecallToPpud.ppudIndeterminateSentenceData,
          dateOfSentence,
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
