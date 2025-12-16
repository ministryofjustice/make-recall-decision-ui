import { NextFunction, Request, Response } from 'express'
import {
  booleanToYesNoOffenceChanges,
  yesNoOffenceChanges,
  yesNoOffenceChangesToBoolean,
  yesNoOffenceChangesValues,
} from './yesNoOffenceChanges'
import { RecommendationResponse } from '../../../../../@types/make-recall-decision-api'
import { isDefined } from '../../../../../utils/utils'
import { makeErrorObject } from '../../../../../utils/errors'
import { strings } from '../../../../../textStrings/en'
import { getRecommendation, updateRecommendation } from '../../../../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../../../../recommendations/helpers/urls'
import { isValueValid } from '../../../../recommendations/formOptions/formOptions'
import { ppcsPaths } from '../../../../../routes/paths/ppcs'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const selectedPpudSentence = (recommendation as RecommendationResponse).ppudOffender.sentences.find(
    s => s.id === recommendation.bookRecallToPpud.ppudSentenceId
  )

  res.locals = {
    ...res.locals,
    page: {
      id: 'areOffenceChangesNeeded',
    },
    selectedPpudSentence,
    selectedOption: booleanToYesNoOffenceChanges(recommendation.bookRecallToPpud.changeOffenceOrAddComment),
    allOptions: yesNoOffenceChanges,
    errors: res.locals.errors,
  }

  res.render('pages/recommendations/ppcs/determinateSentence/areOffenceChangesNeeded')
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { changeOffenceOrAddComment } = req.body

  const {
    user: { token },
    urlInfo,
    flags,
  } = res.locals

  if (!isDefined(changeOffenceOrAddComment) || !isValueValid(changeOffenceOrAddComment, 'yesNoOffenceChanges')) {
    const errorId = 'missingChangeOffenceOrAddComment'

    req.session.errors = [
      makeErrorObject({
        id: 'changeOffenceOrAddComment',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
    return res.redirect(303, req.originalUrl)
  }

  const recommendation = await getRecommendation(recommendationId, token)

  await updateRecommendation({
    recommendationId: String(recommendation.id),
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        changeOffenceOrAddComment: yesNoOffenceChangesToBoolean(changeOffenceOrAddComment),
      },
    },
    token,
    featureFlags: flags,
  })

  const nextPageId =
    changeOffenceOrAddComment === yesNoOffenceChangesValues.YES
      ? ppcsPaths.matchIndexOffence
      : ppcsPaths.sentenceToCommitExistingOffender
  const nextPagePath = nextPageLinkUrl({ nextPageId, urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
