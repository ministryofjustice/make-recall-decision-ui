import { NextFunction, Request, Response } from 'express'
import { prisonSentences, updateRecommendation } from '../../../../data/makeDecisionApiClient'
import { RecommendationResponse } from '../../../../@types/make-recall-decision-api'
import { PrisonSentence } from '../../../../@types/make-recall-decision-api/models/PrisonSentence'
import { Term } from '../../../../@types/make-recall-decision-api/models/RecommendationResponse'
import ppcsPaths from '../../../../routes/paths/ppcs.paths'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'
import { NamedFormError } from '../../../../@types/pagesForms'
import { makeErrorObject } from '../../../../utils/errors'
import strings from '../../../../textStrings/en'

export const TOTAL_SENTENCE_LENGTH_FIELD = 'totalSentenceLength'
const SENTENCE_LENGTH_PARTS = ['years', 'months', 'days'] as const
type SentenceLengthPart = (typeof SENTENCE_LENGTH_PARTS)[number]

const capitalise = (part: SentenceLengthPart) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`
const fieldId = (part: SentenceLengthPart) => `${TOTAL_SENTENCE_LENGTH_FIELD}-${part}`

async function get(_: Request, res: Response, next: NextFunction) {
  const {
    user: { token },
    recommendation: resRecommendation,
    unsavedValues,
  } = res.locals
  const recommendation = resRecommendation as RecommendationResponse

  const sentenceSequences = (await prisonSentences(token, recommendation.personOnProbation.nomsNumber)) || []

  let nomisError
  if (sentenceSequences.length === 0) {
    nomisError = 'No sentences found'
  }

  const sentenceForSelectedOffence = sentenceSequences.find(
    seq =>
      seq.indexSentence.offences.some(o => o.offenderChargeId === recommendation.nomisIndexOffence.selected) ||
      (seq.sentencesInSequence != null &&
        Array.from(new Map(Object.entries(seq.sentencesInSequence)).values())
          .flatMap(x => x)
          .some(s => s.offences.some(o => o.offenderChargeId === recommendation.nomisIndexOffence.selected))),
  )

  const resolveTerm = (term: Term) => {
    switch (term.code) {
      case 'IMP':
        return { key: 'Custodial term', value: term }
      case 'LIC':
        return { key: 'Extended term', value: term }
      default:
        return undefined
    }
  }
  const prisonSentenceToInfo = (sentence: PrisonSentence) => ({
    lineSequence: sentence.lineSequence,
    offence: sentence.offences?.[0].offenceDescription,
    sentenceType: sentence.sentenceTypeDescription,
    court: sentence.courtDescription,
    dateOfSentence: sentence.sentenceDate,
    startDate: sentence.sentenceStartDate,
    sentenceEndDate: sentence.sentenceEndDate,
    sentenceSequenceExpiryDate: sentence.sentenceSequenceExpiryDate,
    sentenceLength:
      sentence.terms && sentence.terms.length < 2
        ? [{ key: 'Sentence length', value: sentence.terms?.[0] ?? {} }]
        : sentence.terms.map(t => resolveTerm(t)),
  })

  const sentenceInfo = sentenceForSelectedOffence
    ? {
        indexSentence: prisonSentenceToInfo(sentenceForSelectedOffence.indexSentence),
        sentencesInSequence: sentenceForSelectedOffence.sentencesInSequence
          ? new Map(
              Array.from(new Map(Object.entries(sentenceForSelectedOffence.sentencesInSequence)), ([k, v]) => [
                k,
                v.map(s => prisonSentenceToInfo(s)),
              ]),
            )
          : null,
      }
    : null

  const savedLength = recommendation.bookRecallToPpud?.totalSentenceLength
  const totalSentenceLength = unsavedValues?.[TOTAL_SENTENCE_LENGTH_FIELD] ?? {
    years: savedLength?.partYears,
    months: savedLength?.partMonths,
    days: savedLength?.partDays,
  }

  res.locals = {
    ...res.locals,
    pageData: {
      nomisError,
      sentenceInfo,
      totalSentenceLength,
    },
  }

  res.render(`pages/recommendations/ppcs/determinateSentence/consecutiveSentences/consecutiveSentenceDetails`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
    recommendation: resRecommendation,
  } = res.locals
  const recommendation = resRecommendation as RecommendationResponse

  const values = Object.fromEntries(
    SENTENCE_LENGTH_PARTS.map(part => [part, ((req.body[part] as string) ?? '').trim()]),
  ) as Record<SentenceLengthPart, string>

  const errors: NamedFormError[] = []
  const missingParts = SENTENCE_LENGTH_PARTS.filter(part => values[part] === '')

  if (missingParts.length === SENTENCE_LENGTH_PARTS.length) {
    const errorId = 'missingTotalSentenceLength'
    errors.push(
      makeErrorObject({
        id: fieldId('years'),
        text: strings.errors[errorId],
        errorId,
        invalidParts: [...SENTENCE_LENGTH_PARTS],
      }),
    )
  } else {
    SENTENCE_LENGTH_PARTS.forEach(part => {
      let errorId: string
      if (missingParts.includes(part)) {
        errorId = `missingTotalSentenceLength${capitalise(part)}`
      } else if (!/^\d+$/.test(values[part])) {
        errorId = `invalidTotalSentenceLength${capitalise(part)}`
      }
      if (errorId) {
        errors.push(
          makeErrorObject({
            id: fieldId(part),
            text: strings.errors[errorId as keyof typeof strings.errors],
            errorId,
            invalidParts: [part],
          }),
        )
      }
    })
  }

  if (errors.length > 0) {
    req.session.errors = errors
    req.session.unsavedValues = { [TOTAL_SENTENCE_LENGTH_FIELD]: values }
    return res.redirect(303, req.originalUrl)
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        totalSentenceLength: {
          partYears: Number(values.years),
          partMonths: Number(values.months),
          partDays: Number(values.days),
        },
      },
    },
    token,
    featureFlags: flags,
  })

  const offenderExistsAndHasSentences = recommendation.ppudOffender && recommendation.ppudOffender.sentences.length > 0
  const nextPageId = offenderExistsAndHasSentences ? ppcsPaths.selectPpudSentence : ppcsPaths.matchIndexOffence
  return res.redirect(303, nextPageLinkUrl({ nextPageId, urlInfo }))
}

export default { get, post }
