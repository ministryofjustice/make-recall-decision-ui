import { NextFunction, Request, Response } from 'express'
import { prisonSentences } from '../../../../data/makeDecisionApiClient'
import { RecommendationResponse } from '../../../../@types/make-recall-decision-api'
import { PrisonSentence } from '../../../../@types/make-recall-decision-api/models/PrisonSentence'
import { Term } from '../../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { ppcsPaths } from '../../../../routes/paths/ppcs.paths'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'

async function get(_: Request, res: Response, next: NextFunction) {
  const {
    user: { token },
    recommendation: resRecommendation,
    urlInfo,
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
          .some(s => s.offences.some(o => o.offenderChargeId === recommendation.nomisIndexOffence.selected)))
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
    offence: sentence.offences.at(0).offenceDescription,
    sentenceType: sentence.sentenceTypeDescription,
    court: sentence.courtDescription,
    dateOfSentence: sentence.sentenceDate,
    startDate: sentence.sentenceStartDate,
    sentenceExpiryDate: sentence.sentenceEndDate,
    sentenceLength:
      sentence.terms && sentence.terms.length < 2
        ? [{ key: 'Sentence length', value: sentence.terms.at(0) ?? {} }]
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
              ])
            )
          : null,
      }
    : null

  res.locals = {
    ...res.locals,
    pageData: {
      nomisError,
      sentenceInfo,
      nextPagePath: nextPageLinkUrl({ nextPageId: ppcsPaths.matchIndexOffence, urlInfo }),
    },
  }

  res.render(`pages/recommendations/ppcs/determinateSentence/consecutiveSentences/consecutiveSentenceDetails`)
  next()
}

export default { get }
