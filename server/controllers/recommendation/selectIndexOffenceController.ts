import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { getRecommendation, prisonSentences, updateRecommendation } from '../../data/makeDecisionApiClient'
import { NamedFormError } from '../../@types/pagesForms'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { hasValue, isDefined, isEmptyStringOrWhitespace } from '../../utils/utils'
import { Term } from '../../@types/make-recall-decision-api/models/RecommendationResponse'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    recommendation,
  } = res.locals

  const sentences = (await prisonSentences(token, recommendation.personOnProbation.nomsNumber)) || []

  let nomisError
  if (hasValue(sentences) && sentences.length === 0) {
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

  const nomisOffenceData = sentences?.flatMap(s =>
    s?.offences?.map(o => ({
      id: o.offenderChargeId,
      description: o.offenceDescription,
      sentenceType: s.sentenceTypeDescription,
      court: s.courtDescription,
      dateOfSentence: s.sentenceDate,
      startDate: s.sentenceStartDate,
      endDate: s.sentenceEndDate,
      terms:
        s.terms.length < 2
          ? [{ key: 'Sentence length', value: s.terms.at(0) ?? {} }]
          : s.terms.map(t => resolveTerm(t)),
      consecutiveCount: s.consecutiveGroup?.length,
    }))
  )

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

  const allOptions = sentences
    .flatMap(sentence => {
      if (sentence?.offences) {
        return sentence.offences.map(offence => {
          return {
            offenderChargeId: offence.offenderChargeId,
            offenceCode: offence.offenceCode,
            offenceDate: offence.offenceStartDate,
            offenceStatute: offence.offenceStatute,
            offenceDescription: offence.offenceDescription,
            sentenceDate: sentence.sentenceDate,
            courtDescription: sentence.courtDescription,
            sentenceStartDate: sentence.sentenceStartDate,
            sentenceEndDate: sentence.sentenceEndDate,
            bookingId: sentence.bookingId,
            terms: sentence.terms,
            sentenceTypeDescription: sentence.sentenceTypeDescription,
            releaseDate: sentence.releaseDate,
            releasingPrison: sentence.releasingPrison,
            licenceExpiryDate: sentence.licenceExpiryDate,
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

  res.render(`pages/recommendations/selectIndexOffence`)
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

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'match-index-offence', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))

  next()
}

export default { get, post }
