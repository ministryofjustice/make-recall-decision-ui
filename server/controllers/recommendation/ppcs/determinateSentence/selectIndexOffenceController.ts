import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'
import { getRecommendation, prisonSentences, updateRecommendation } from '../../../../data/makeDecisionApiClient'
import { NamedFormError } from '../../../../@types/pagesForms'
import { RecommendationResponse } from '../../../../@types/make-recall-decision-api'
import { makeErrorObject } from '../../../../utils/errors'
import { strings } from '../../../../textStrings/en'
import { isDefined, isEmptyStringOrWhitespace } from '../../../../utils/utils'
import { OfferedOffence, Term } from '../../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { ppcsPaths } from '../../../../routes/paths/ppcs'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    recommendation,
  } = res.locals

  const sentenceSequences = (await prisonSentences(token, recommendation.personOnProbation.nomsNumber)) || []

  let nomisError
  if (sentenceSequences.length === 0) {
    nomisError = 'No sentences found'
  }

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

  const nomisOffenceData = sentenceSequences?.flatMap(seq => {
    const { indexSentence } = seq
    const indexOffence = indexSentence.offences.at(0)
    return {
      id: indexOffence.offenderChargeId,
      description: indexOffence.offenceDescription,
      sentenceType: indexSentence.sentenceTypeDescription,
      court: indexSentence.courtDescription,
      dateOfSentence: indexSentence.sentenceDate,
      startDate: indexSentence.sentenceStartDate,
      endDate: indexSentence.sentenceEndDate,
      sentenceSequenceExpiryDate: indexSentence.sentenceSequenceExpiryDate,
      terms:
        indexSentence.terms.length < 2
          ? [{ key: 'Sentence length', value: seq.indexSentence.terms.at(0) ?? {} }]
          : seq.indexSentence.terms.map(t => resolveTerm(t)),
      consecutiveCount: seq.sentencesInSequence
        ? Array.from(new Map(Object.entries(seq.sentencesInSequence)).values()).flatMap(x => x).length
        : undefined,
    }
  })

  const { convictionDetail } = recommendation
  const isExtended: boolean =
    !isEmptyStringOrWhitespace(convictionDetail?.custodialTerm) &&
    !isEmptyStringOrWhitespace(convictionDetail?.extendedTerm)
  const convictionData = {
    description: convictionDetail.indexOffenceDescription,
    dateOfSentence: convictionDetail.dateOfSentence,
    sentenceType: convictionDetail.sentenceDescription,
    sentenceExpiryDate: convictionDetail.sentenceExpiryDate,
    terms: isExtended
      ? [
          { key: 'Custodial term', value: convictionDetail.custodialTerm },
          { key: 'Extended term', value: convictionDetail.extendedTerm },
        ]
      : [
          {
            key: 'Sentence length',
            value: `${convictionDetail.lengthOfSentence} ${convictionDetail.lengthOfSentenceUnits}`,
          },
        ],
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'selectIndexOffence',
    },
    pageData: {
      offenderName: `${recommendation.bookRecallToPpud.firstNames} ${recommendation.bookRecallToPpud.lastName}`,
      nomisOffenceData,
      convictionData,
    },
    nomisError,
  }

  const allOptions: OfferedOffence[] = sentenceSequences
    .flatMap(seq => {
      if (seq?.indexSentence.offences) {
        return seq.indexSentence.offences.slice(0, 1).map(offence => {
          return {
            consecutiveCount: seq.sentencesInSequence
              ? Array.from(new Map(Object.entries(seq.sentencesInSequence)).values()).flatMap(x => x).length
              : undefined,
            offenderChargeId: offence.offenderChargeId,
            offenceCode: offence.offenceCode,
            offenceDate: offence.offenceStartDate,
            offenceStatute: offence.offenceStatute,
            offenceDescription: offence.offenceDescription,
            sentenceDate: seq.indexSentence.sentenceDate,
            courtDescription: seq.indexSentence.courtDescription,
            sentenceStartDate: seq.indexSentence.sentenceStartDate,
            sentenceEndDate: seq.indexSentence.sentenceEndDate,
            sentenceSequenceExpiryDate: seq.indexSentence.sentenceSequenceExpiryDate,
            bookingId: seq.indexSentence.bookingId,
            terms: seq.indexSentence.terms,
            sentenceTypeDescription: seq.indexSentence.sentenceTypeDescription,
            releaseDate: seq.indexSentence.releaseDate,
            releasingPrison: seq.indexSentence.releasingPrison,
            licenceExpiryDate: seq.indexSentence.licenceExpiryDate,
          }
        })
      }
      return undefined
    })
    .filter(isDefined)

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      nomisIndexOffence: {
        selected: recommendation.nomisIndexOffence?.selected,
        allOptions,
      },
    },
    token,
    featureFlags: flags,
  })

  res.render(`pages/recommendations/ppcs/determinateSentence/selectIndexOffence`)
  next()
}

async function post(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const errors: NamedFormError[] = []

  const { indexOffence } = req.body

  if (indexOffence === undefined) {
    const errorId = 'noIndexOffenceSelected'
    errors.push(
      makeErrorObject({
        id: 'indexOffence',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    return res.redirect(303, req.originalUrl)
  }

  const recommendation = (await getRecommendation(recommendationId, token)) as RecommendationResponse
  const indexOffenceData = recommendation.nomisIndexOffence.allOptions.find(
    option => option.offenderChargeId === Number(indexOffence)
  )
  const sentences = (await prisonSentences(token, recommendation.personOnProbation.nomsNumber)) || []
  const sentenceForOffence = sentences.find(
    s => s.indexSentence.offences?.at(0)?.offenderChargeId === indexOffenceData.offenderChargeId
  )
  const sentenceHasConsecutive = sentenceForOffence.sentencesInSequence != null

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      nomisIndexOffence: {
        selected: indexOffence,
        allOptions: recommendation.nomisIndexOffence?.allOptions,
      },
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        sentenceDate: indexOffenceData.sentenceDate,
      },
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = nextPageLinkUrl({
    nextPageId: sentenceHasConsecutive ? ppcsPaths.consecutiveSentenceDetails : ppcsPaths.matchIndexOffence,
    urlInfo,
  })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
  next()
}

export default { get, post }
