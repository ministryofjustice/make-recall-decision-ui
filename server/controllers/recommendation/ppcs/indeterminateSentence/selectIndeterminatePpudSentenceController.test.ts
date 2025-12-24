import { randomUUID } from 'node:crypto'
import { randomInt } from 'crypto'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import {
  calculatePartACustodyGroup,
  getDeterminateSentences,
  getIndeterminateSentences,
} from '../../../../helpers/ppudSentence/ppudSentenceHelper'
import { PpudDetailsSentence } from '../../../../@types/make-recall-decision-api/models/PpudDetailsResponse'
import { updateRecommendation } from '../../../../data/makeDecisionApiClient'
import { CUSTODY_GROUP } from '../../../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { ppudDetailsSentence } from '../../../../@types/make-recall-decision-api/models/ppud/PpudDetailsResponse.testFactory'
import { randomEnum } from '../../../../@types/enum.testFactory'
import selectIndeterminatePpudSentenceController from './selectIndeterminatePpudSentenceController'
import { makeErrorObject } from '../../../../utils/errors'
import { NamedFormError } from '../../../../@types/pagesForms'
import { strings } from '../../../../textStrings/en'
import { featureFlags } from '../../../../@types/featureFlags.testFactory'
import { RecommendationResponseGenerator } from '../../../../../data/recommendations/recommendationGenerator'

jest.mock('../../../../data/makeDecisionApiClient')
jest.mock('../../../../helpers/ppudSentence/ppudSentenceHelper')
jest.mock('../../../../utils/errors')

const sentenceId = faker.number.int().toString()
const recommendation = RecommendationResponseGenerator.generate({
  ppudOffender: {
    sentences: [{ id: sentenceId, custodyType: 'IPP' }, { custodyType: 'DPP' }, { custodyType: 'Mandatory (MLP)' }],
  },
})
const expectedSentence = recommendation.ppudOffender.sentences.at(0)

describe('get', () => {
  it('load with no sentence selected', async () => {
    const res = mockRes({
      locals: {
        user: {
          token: randomUUID(),
        },
        recommendation,
      },
    })
    const req = mockReq({
      params: {
        recommendationId: randomInt(0, 10000).toString(),
      },
    })
    const next = mockNext()

    const custodyGroup: CUSTODY_GROUP = randomEnum(CUSTODY_GROUP)
    ;(calculatePartACustodyGroup as jest.Mock).mockReturnValueOnce(custodyGroup)

    const indeterminateSentences: PpudDetailsSentence[] = [ppudDetailsSentence()]
    const determinateSentences: PpudDetailsSentence[] = [ppudDetailsSentence()]
    ;(getIndeterminateSentences as jest.Mock).mockReturnValueOnce(indeterminateSentences)
    ;(getDeterminateSentences as jest.Mock).mockReturnValueOnce(determinateSentences)

    const expectedPageData = {
      nomisSentence: {
        offenceDescription: recommendation.convictionDetail.indexOffenceDescription,
        custodyGroup,
        dateOfSentence: recommendation.convictionDetail.dateOfSentence,
        sentenceExpiryDate: recommendation.convictionDetail.sentenceExpiryDate,
      },
      ppudSentences: indeterminateSentences,
      determinateSentencesCount: determinateSentences.length,
      fullName: recommendation.personOnProbation.name,
    }

    // when
    await selectIndeterminatePpudSentenceController.get(req, res, next)

    // then
    expect(res.locals.page.id).toEqual('selectIndeterminatePpudSentence')
    expect(res.locals.selectIndeterminatePpudSentencePageData).toEqual(expectedPageData)
    expect(res.locals.recommendation).toEqual(recommendation)

    expect(getIndeterminateSentences).toHaveBeenCalledWith(recommendation.ppudOffender.sentences)
    expect(getDeterminateSentences).toHaveBeenCalledWith(recommendation.ppudOffender.sentences)
    expect(calculatePartACustodyGroup).toHaveBeenCalledWith(recommendation)
    expect(res.render).toHaveBeenCalledWith(
      'pages/recommendations/ppcs/indeterminateSentence/selectIndeterminatePpudSentence'
    )
    expect(next).toHaveBeenCalled()
  })

  it('load with a sentence selected', async () => {
    // given
    const res = mockRes({
      locals: {
        user: {
          token: randomUUID(),
        },
        recommendation,
      },
    })
    const req = mockReq({
      params: {
        recommendationId: randomInt(0, 10000).toString(),
      },
    })
    const next = mockNext()

    const custodyGroup: CUSTODY_GROUP = randomEnum(CUSTODY_GROUP)
    ;(calculatePartACustodyGroup as jest.Mock).mockReturnValueOnce(custodyGroup)

    const indeterminateSentences: PpudDetailsSentence[] = [ppudDetailsSentence()]
    const determinateSentences: PpudDetailsSentence[] = [ppudDetailsSentence()]
    ;(getIndeterminateSentences as jest.Mock).mockReturnValueOnce(indeterminateSentences)
    ;(getDeterminateSentences as jest.Mock).mockReturnValueOnce(determinateSentences)

    const expectedPageData = {
      nomisSentence: {
        offenceDescription: recommendation.convictionDetail.indexOffenceDescription,
        custodyGroup,
        dateOfSentence: recommendation.convictionDetail.dateOfSentence,
        sentenceExpiryDate: recommendation.convictionDetail.sentenceExpiryDate,
      },
      ppudSentences: indeterminateSentences,
      determinateSentencesCount: determinateSentences.length,
      selectedSentenceId: recommendation.bookRecallToPpud.ppudSentenceId,
      fullName: recommendation.personOnProbation.name,
    }

    // when
    await selectIndeterminatePpudSentenceController.get(req, res, next)

    // then
    expect(res.locals.page.id).toEqual('selectIndeterminatePpudSentence')
    expect(res.locals.selectIndeterminatePpudSentencePageData).toEqual(expectedPageData)
    expect(res.locals.recommendation).toEqual(recommendation)

    expect(getIndeterminateSentences).toHaveBeenCalledWith(recommendation.ppudOffender.sentences)
    expect(getDeterminateSentences).toHaveBeenCalledWith(recommendation.ppudOffender.sentences)
    expect(calculatePartACustodyGroup).toHaveBeenCalledWith(recommendation)
    expect(res.render).toHaveBeenCalledWith(
      'pages/recommendations/ppcs/indeterminateSentence/selectIndeterminatePpudSentence'
    )
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('select ppud sentence', async () => {
    // given
    ;(getIndeterminateSentences as jest.Mock).mockReturnValueOnce(recommendation.ppudOffender.sentences)

    const req = mockReq({
      params: { recommendationId: randomInt(0, 10000).toString() },
      body: { ppudSentenceId: sentenceId },
    })
    const res = mockRes({
      token: randomUUID(),
      locals: {
        urlInfo: { basePath: randomUUID() },
        flags: featureFlags(),
        recommendation,
      },
    })

    const next = mockNext()

    // when
    await selectIndeterminatePpudSentenceController.post(req, res, next)

    // then
    expect(getIndeterminateSentences).toHaveBeenCalledWith(recommendation.ppudOffender.sentences)
    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: res.locals.flags,
      recommendationId: req.params.recommendationId,
      token: res.locals.user.token,
      valuesToSave: {
        bookRecallToPpud: {
          ...recommendation.bookRecallToPpud,
          ppudSentenceId: req.body.ppudSentenceId,
          ppudIndeterminateSentenceData: {
            offenceDescription: expectedSentence.offence.indexOffence,
            offenceDescriptionComment: expectedSentence.offence.offenceComment,
            releaseDate: expectedSentence.releaseDate,
            sentencingCourt: expectedSentence.sentencingCourt,
            dateOfSentence: expectedSentence.dateOfSentence,
          },
        },
      },
    })
    expect(res.redirect).toHaveBeenCalledWith(303, `${res.locals.urlInfo.basePath}sentence-to-commit-indeterminate`)
    expect(next).not.toHaveBeenCalled()
  })

  it('missing ppud sentence', async () => {
    // given
    const req = mockReq({
      originalUrl: randomUUID(),
      body: {},
    })

    const res = mockRes({
      locals: {
        flags: featureFlags(),
        recommendation: {
          ppudOffender: {
            sentences: [ppudDetailsSentence()],
          },
        },
      },
    })

    const next = mockNext()

    const errorObject: NamedFormError = {
      name: randomUUID(),
      text: randomUUID(),
    }
    ;(makeErrorObject as jest.Mock).mockReturnValueOnce(errorObject)

    // when
    await selectIndeterminatePpudSentenceController.post(req, res, next)

    // then
    expect(req.session.errors).toEqual([errorObject])
    expect(makeErrorObject).toHaveBeenCalledWith({
      id: 'ppudSentenceId',
      text: strings.errors.missingIndeterminatePpudSentence,
      errorId: 'missingIndeterminatePpudSentence',
    })
    expect(res.redirect).toHaveBeenCalledWith(303, req.originalUrl)
    expect(next).not.toHaveBeenCalled()
  })

  it('invalid ppud sentence', async () => {
    // given
    const indeterminateSentences: PpudDetailsSentence[] = [ppudDetailsSentence()]
    ;(getIndeterminateSentences as jest.Mock).mockReturnValueOnce(indeterminateSentences)

    const req = mockReq({
      originalUrl: randomUUID(),
      body: { ppudSentenceId: randomInt(0, 10000).toString() },
    })

    const invalidSentenceRecommendation = {
      ppudOffender: {
        sentences: [ppudDetailsSentence()],
      },
    }
    const res = mockRes({
      locals: {
        recommendation: invalidSentenceRecommendation,
      },
    })

    const next = mockNext()

    const errorObject: NamedFormError = {
      name: randomUUID(),
      text: randomUUID(),
    }
    ;(makeErrorObject as jest.Mock).mockReturnValueOnce(errorObject)

    // when
    await selectIndeterminatePpudSentenceController.post(req, res, next)

    // then
    expect(req.session.errors).toEqual([errorObject])
    expect(getIndeterminateSentences).toHaveBeenCalledWith(invalidSentenceRecommendation.ppudOffender.sentences)
    expect(makeErrorObject).toHaveBeenCalledWith({
      id: 'ppudSentenceId',
      text: strings.errors.invalidIndeterminatePpudSentenceSelected,
      errorId: 'invalidIndeterminatePpudSentenceSelected',
    })
    expect(res.redirect).toHaveBeenCalledWith(303, req.originalUrl)
    expect(next).not.toHaveBeenCalled()
  })
})
