import { randomUUID } from 'node:crypto'
import { randomInt } from 'crypto'
import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import { getCustodyGroup, getIndeterminateSentences } from '../../../../helpers/ppudSentence/ppudSentenceHelper'
import { PpudDetailsSentence } from '../../../../@types/make-recall-decision-api/models/PpudDetailsResponse'
import { updateRecommendation } from '../../../../data/makeDecisionApiClient'
import { CUSTODY_GROUP } from '../../../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { ppudDetailsSentence } from '../../../../@types/make-recall-decision-api/models/ppud/PpudDetailsResponse.testFactory'
import { randomBoolean } from '../../../../@types/boolean.testFactory'
import { randomDate } from '../../../../@types/dates.testFactory'
import { randomEnum } from '../../../../@types/enum.testFactory'
import selectIndeterminatePpudSentenceController from './selectIndeterminatePpudSentenceController'
import { makeErrorObject } from '../../../../utils/errors'
import { NamedFormError } from '../../../../@types/pagesForms'
import { strings } from '../../../../textStrings/en'
import { featureFlags } from '../../../../@types/featureFlags.testFactory'

jest.mock('../../../../data/makeDecisionApiClient')
jest.mock('../../../../helpers/ppudSentence/ppudSentenceHelper')
jest.mock('../../../../utils/errors')

describe('get', () => {
  it('load with no sentence selected', async () => {
    // given
    const recommendation = {
      id: randomInt(0, 10000).toString(),
      convictionDetail: {
        indexOffenceDescription: randomUUID(),
        dateOfSentence: randomDate().toDateString(),
        sentenceExpiryDate: randomDate().toDateString(),
      },
      ppudOffender: {
        sentences: ppudDetailsSentence(),
      },
      isIndeterminateSentence: randomBoolean(),
      bookRecallToPpud: {},
    }
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
    ;(getCustodyGroup as jest.Mock).mockReturnValueOnce(custodyGroup)

    const indeterminateSentences: PpudDetailsSentence[] = [ppudDetailsSentence()]
    ;(getIndeterminateSentences as jest.Mock).mockReturnValueOnce(indeterminateSentences)

    const expectedPageData = {
      nomisSentence: {
        offenceDescription: recommendation.convictionDetail.indexOffenceDescription,
        custodyGroup,
        dateOfSentence: recommendation.convictionDetail.dateOfSentence,
        sentenceExpiryDate: recommendation.convictionDetail.sentenceExpiryDate,
      },
      ppudSentences: indeterminateSentences,
    }

    // when
    await selectIndeterminatePpudSentenceController.get(req, res, next)

    // then
    expect(res.locals.page.id).toEqual('selectIndeterminatePpudSentence')
    expect(res.locals.selectIndeterminatePpudSentencePageData).toEqual(expectedPageData)
    expect(res.locals.recommendation).toEqual(recommendation)

    expect(getIndeterminateSentences).toHaveBeenCalledWith(recommendation.ppudOffender.sentences)
    expect(getCustodyGroup).toHaveBeenCalledWith(recommendation)
    expect(res.render).toHaveBeenCalledWith(
      'pages/recommendations/ppcs/indeterminateSentence/selectIndeterminatePpudSentence'
    )
    expect(next).toHaveBeenCalled()
  })

  it('load with a sentence selected', async () => {
    // given
    const recommendation = {
      id: randomInt(0, 10000).toString(),
      convictionDetail: {
        indexOffenceDescription: randomUUID(),
        dateOfSentence: randomDate().toDateString(),
        sentenceExpiryDate: randomDate().toDateString(),
      },
      ppudOffender: {
        sentences: ppudDetailsSentence(),
      },
      isIndeterminateSentence: randomBoolean(),
      bookRecallToPpud: {
        ppudSentenceId: randomUUID(),
      },
    }
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
    ;(getCustodyGroup as jest.Mock).mockReturnValueOnce(custodyGroup)

    const indeterminateSentences: PpudDetailsSentence[] = [ppudDetailsSentence()]
    ;(getIndeterminateSentences as jest.Mock).mockReturnValueOnce(indeterminateSentences)

    const expectedPageData = {
      nomisSentence: {
        offenceDescription: recommendation.convictionDetail.indexOffenceDescription,
        custodyGroup,
        dateOfSentence: recommendation.convictionDetail.dateOfSentence,
        sentenceExpiryDate: recommendation.convictionDetail.sentenceExpiryDate,
      },
      ppudSentences: indeterminateSentences,
      selectedSentenceId: recommendation.bookRecallToPpud.ppudSentenceId,
    }

    // when
    await selectIndeterminatePpudSentenceController.get(req, res, next)

    // then
    expect(res.locals.page.id).toEqual('selectIndeterminatePpudSentence')
    expect(res.locals.selectIndeterminatePpudSentencePageData).toEqual(expectedPageData)
    expect(res.locals.recommendation).toEqual(recommendation)

    expect(getIndeterminateSentences).toHaveBeenCalledWith(recommendation.ppudOffender.sentences)
    expect(getCustodyGroup).toHaveBeenCalledWith(recommendation)
    expect(res.render).toHaveBeenCalledWith(
      'pages/recommendations/ppcs/indeterminateSentence/selectIndeterminatePpudSentence'
    )
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('select ppud sentence', async () => {
    // given
    const ppudSentenceId = randomInt(0, 10000).toString()
    const indeterminateSentences: PpudDetailsSentence[] = [ppudDetailsSentence({ id: ppudSentenceId })]
    ;(getIndeterminateSentences as jest.Mock).mockReturnValueOnce(indeterminateSentences)

    const req = mockReq({
      params: { recommendationId: randomInt(0, 10000).toString() },
      body: { ppudSentenceId },
    })

    // We include bookRecallToPpud values just to ensure they aren't overridden by the post method
    const recommendation = {
      bookRecallToPpud: {
        mappaLevel: randomUUID(),
      },
      ppudOffender: {
        sentences: [ppudDetailsSentence()],
      },
    }
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
        },
      },
    })
    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
    // TODO MRD-2687 replace the two lines above with the lines below once the next page is added
    // expect(nextPageLinkUrl).toHaveBeenNthCalledWith(1, { nextPageId: 'check-booking-details', urlInfo })
    // expect(nextPageLinkUrl).toHaveBeenNthCalledWith(2, { nextPagePath, urlInfo })
    // expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/sentence-to-commit-existing-offender`)
    // expect(next).toHaveBeenCalled()
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
      id: 'ppudSentenceId', // TODO should this also be passed into the njk to use as an anchor id?
      text: strings.errors.noIndeterminatePpudSentenceSelected,
      errorId: 'noIndeterminatePpudSentenceSelected',
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

    const recommendation = {
      ppudOffender: {
        sentences: [ppudDetailsSentence()],
      },
    }
    const res = mockRes({
      locals: {
        recommendation,
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
    expect(getIndeterminateSentences).toHaveBeenCalledWith(recommendation.ppudOffender.sentences)
    expect(makeErrorObject).toHaveBeenCalledWith({
      id: 'ppudSentenceId',
      text: strings.errors.invalidIndeterminatePpudSentenceSelected,
      errorId: 'invalidIndeterminatePpudSentenceSelected',
    })
    expect(res.redirect).toHaveBeenCalledWith(303, req.originalUrl)
    expect(next).not.toHaveBeenCalled()
  })
})
