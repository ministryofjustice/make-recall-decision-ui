import { NextFunction, Request, Response } from 'express'
import { ppudReferenceList, updateRecommendation } from '../../../../../data/makeDecisionApiClient'
import { makeErrorObject } from '../../../../../utils/errors'
import { strings } from '../../../../../textStrings/en'
import { nextPageLinkUrl } from '../../../../recommendations/helpers/urls'
import { isDefined, isEmptyStringOrWhitespace } from '../../../../../utils/utils'
import { RecommendationResponse } from '../../../../../@types/make-recall-decision-api'
import { NamedFormError } from '../../../../../@types/pagesForms'

async function get(req: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    unsavedValues,
    user: { token },
  } = res.locals

  const recommendationResponse = recommendation as RecommendationResponse
  const ppudSentence = recommendationResponse.ppudOffender.sentences.find(
    s => s.id === recommendation.bookRecallToPpud.ppudSentenceId
  )
  const existingOffenceDescription = ppudSentence.offence.indexOffence
  const pendingSentenceData = recommendationResponse.bookRecallToPpud.ppudIndeterminateSentenceData

  // A list of all index offences for the PoP
  const list = await ppudReferenceList(token, 'index-offences')
  const allOffences = list.values.map(value => {
    return {
      text: value,
      value,
    }
  })

  res.locals = {
    ...res.locals,
    page: {
      id: 'editOffence',
    },
    existingOffenceDescription,
    // If the value hasn't changed, don't preselect anything in the autocomplete
    offenceDescription:
      existingOffenceDescription === pendingSentenceData.offenceDescription
        ? null
        : pendingSentenceData.offenceDescription,
    offenceDescriptionComment:
      unsavedValues?.offenceDescriptionComment ?? pendingSentenceData.offenceDescriptionComment,
    allOffences,
    errors: res.locals.errors,
  }

  res.render(`pages/recommendations/ppcs/indeterminateSentence/edit/editOffence`)
  next()
}

async function post(req: Request, res: Response, next: NextFunction) {
  const { offenceDescription, offenceDescriptionComment } = req.body
  const { recommendationId } = req.params

  const { urlInfo, recommendation } = res.locals

  const errors: NamedFormError[] = []

  if (!isDefined(offenceDescription)) {
    const errorId = 'missingIndexOffence'
    errors.push(
      makeErrorObject({
        id: 'offenceDescription',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    req.session.unsavedValues = {
      offenceDescriptionComment,
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
          offenceDescription,
          offenceDescriptionComment: isEmptyStringOrWhitespace(offenceDescriptionComment)
            ? null
            : offenceDescriptionComment,
        },
      },
    },
    featureFlags: res.locals.flags,
    token: res.locals.user.token,
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'sentence-to-commit-indeterminate', urlInfo }))
}

export default { get, post }
