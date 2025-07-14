import { randomInt } from 'crypto'
import { randomUUID } from 'node:crypto'
import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import editCustodyGroupController from './editCustodyGroupController'
import { CUSTODY_GROUP } from '../../../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { randomEnum } from '../../../../@types/enum.testFactory'
import { updateRecommendation } from '../../../../data/makeDecisionApiClient'
import { featureFlags } from '../../../../@types/featureFlags.testFactory'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'
import {
  bookRecallToPpud,
  nomisIndexOffence,
} from '../../../../@types/make-recall-decision-api/models/RecommendationResponse.testFactory'
import { BookRecallToPpud } from '../../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { calculatePartACustodyGroup } from '../../../../helpers/ppudSentence/ppudSentenceHelper'
import { determineErrorId, reloadPageWithError } from '../validation/fieldValidation'
import { randomErrorId } from '../../../../textStrings/en.testFactory'

jest.mock('../../../../data/makeDecisionApiClient')
jest.mock('../../../../helpers/ppudSentence/ppudSentenceHelper')
jest.mock('../../../recommendations/helpers/urls')
jest.mock('../../../../utils/errors')
jest.mock('../validation/fieldValidation')

describe('get', () => {
  it('load when custody group not set', async () => {
    // given
    const req = mockReq()

    const initialBookRecallToPpud: BookRecallToPpud = bookRecallToPpud()
    delete initialBookRecallToPpud.custodyGroup
    const res = mockRes({
      locals: {
        recommendation: {
          bookRecallToPpud: initialBookRecallToPpud,
        },
      },
    })
    const next = mockNext()

    const partACustodyGroup: CUSTODY_GROUP = randomEnum(CUSTODY_GROUP)
    ;(calculatePartACustodyGroup as jest.Mock).mockReturnValueOnce(partACustodyGroup)

    // when
    await editCustodyGroupController.get(req, res, next)

    // then
    expect(res.locals).toEqual({
      ...res.locals,
      page: { id: 'editCustodyGroup' },
      editCustodyGroupPageData: {
        custodyGroups: Object.values(CUSTODY_GROUP),
        partACustodyGroup,
      },
    })
    expect(calculatePartACustodyGroup).toHaveBeenCalledWith(res.locals.recommendation)
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/ppcs/editCustodyGroup')
    expect(next).toHaveBeenCalled()
  })
  it('load when custody group set', async () => {
    // given
    const req = mockReq()

    const res = mockRes({
      locals: {
        recommendation: {
          bookRecallToPpud: bookRecallToPpud(),
        },
      },
    })
    const next = mockNext()

    const partACustodyGroup: CUSTODY_GROUP = randomEnum(CUSTODY_GROUP)
    ;(calculatePartACustodyGroup as jest.Mock).mockReturnValueOnce(partACustodyGroup)

    // when
    await editCustodyGroupController.get(req, res, next)

    // then
    expect(res.locals).toEqual({
      ...res.locals,
      page: { id: 'editCustodyGroup' },
      editCustodyGroupPageData: {
        custodyGroups: Object.values(CUSTODY_GROUP),
        selectedCustodyGroup: res.locals.recommendation.bookRecallToPpud.custodyGroup,
        partACustodyGroup,
      },
    })
    expect(calculatePartACustodyGroup).toHaveBeenCalledWith(res.locals.recommendation)
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/ppcs/editCustodyGroup')
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  const custodyGroupFieldName = 'CustodyGroup'
  const validCustodyGroups = Object.values(CUSTODY_GROUP)
  it('valid value selected, no previous value selected', async () => {
    // given
    const req = mockReq({
      body: {
        custodyGroup: randomEnum(CUSTODY_GROUP),
      },
    })

    const recommendation = {
      id: randomInt(0, 10000).toString(),
      bookRecallToPpud: bookRecallToPpud(),
    }
    delete recommendation.bookRecallToPpud.custodyGroup
    const res = mockRes({
      token: randomUUID(),
      locals: {
        urlInfo: { basePath: randomUUID() },
        flags: featureFlags(),
        recommendation,
      },
    })
    const next = mockNext()

    ;(determineErrorId as jest.Mock).mockReturnValue(undefined)
    ;(updateRecommendation as jest.Mock).mockReturnValue({})

    const nextPagePath: string = 'nextPagePath'
    const nextPageLink: string = 'nextPageLink'
    ;(nextPageLinkUrl as jest.Mock).mockReturnValueOnce(nextPagePath).mockReturnValueOnce(nextPageLink)

    // when
    await editCustodyGroupController.post(req, res, next)

    // then
    expect(determineErrorId).toHaveBeenCalledWith(req.body.custodyGroup, custodyGroupFieldName, validCustodyGroups)

    const expectedBookRecallToPpud = {
      ...recommendation.bookRecallToPpud,
      custodyGroup: req.body.custodyGroup,
    }
    // TODO temporary expectation until the temporary measure in the
    //      controller is removed as part of MRD-2703
    if (req.body.custodyGroup === CUSTODY_GROUP.DETERMINATE) {
      expectedBookRecallToPpud.custodyType = req.body.custodyGroup
    }
    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: recommendation.id,
      featureFlags: res.locals.flags,
      token: res.locals.user.token,
      valuesToSave: {
        bookRecallToPpud: expectedBookRecallToPpud,
      },
    })

    expect(nextPageLinkUrl).toHaveBeenNthCalledWith(1, {
      nextPageId: 'check-booking-details',
      urlInfo: res.locals.urlInfo,
    })
    expect(nextPageLinkUrl).toHaveBeenNthCalledWith(2, { nextPagePath, urlInfo: res.locals.urlInfo })
    expect(res.redirect).toHaveBeenCalledWith(303, nextPageLink)
    expect(next).not.toHaveBeenCalled()
  })
  it('valid value selected, change from previous value, wiping selected offence and sentence data', async () => {
    // given
    const req = mockReq({
      originalUrl: randomUUID(),
      body: {
        custodyGroup: randomEnum(CUSTODY_GROUP),
      },
    })

    const initialBookRecallToPpud = bookRecallToPpud({
      custodyGroup: randomEnum(CUSTODY_GROUP, [req.body.custodyGroup]),
    })
    const res = mockRes({
      locals: {
        recommendation: {
          id: randomInt(0, 10000).toString(),
          // these values are set in the offence and sentence selection pages and
          // should be removed whenever the custodyGroup is changed so as not to
          // accidentally book details no longer relevant (e.g. an Indeterminate
          // sentence ID after having switched the custody group to Determinate)
          nomisIndexOffence: nomisIndexOffence(),
          bookRecallToPpud: initialBookRecallToPpud,
        },
      },
    })
    const next = mockNext()

    ;(determineErrorId as jest.Mock).mockReturnValue(undefined)
    ;(updateRecommendation as jest.Mock).mockReturnValue({})

    const nextPagePath: string = 'nextPagePath'
    const nextPageLink: string = 'nextPageLink'
    ;(nextPageLinkUrl as jest.Mock).mockReturnValueOnce(nextPagePath).mockReturnValueOnce(nextPageLink)

    // when
    await editCustodyGroupController.post(req, res, next)

    // then
    expect(determineErrorId).toHaveBeenCalledWith(req.body.custodyGroup, custodyGroupFieldName, validCustodyGroups)

    const expectedBookRecallToPpud = {
      ...initialBookRecallToPpud,
      custodyGroup: req.body.custodyGroup,
    }
    delete expectedBookRecallToPpud.sentenceDate
    delete expectedBookRecallToPpud.indexOffence
    delete expectedBookRecallToPpud.indexOffenceComment
    delete expectedBookRecallToPpud.ppudSentenceId
    // TODO temporary expectation until the temporary measure in the
    //      controller is removed as part of MRD-2703
    if (req.body.custodyGroup === CUSTODY_GROUP.DETERMINATE) {
      expectedBookRecallToPpud.custodyType = req.body.custodyGroup
    } else {
      delete expectedBookRecallToPpud.custodyType
    }
    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: res.locals.flags,
      recommendationId: res.locals.recommendation.id,
      token: res.locals.user.token,
      valuesToSave: {
        nomisIndexOffence: {},
        bookRecallToPpud: expectedBookRecallToPpud,
      },
    })

    expect(nextPageLinkUrl).toHaveBeenNthCalledWith(1, {
      nextPageId: 'check-booking-details',
      urlInfo: res.locals.urlInfo,
    })
    expect(nextPageLinkUrl).toHaveBeenNthCalledWith(2, { nextPagePath, urlInfo: res.locals.urlInfo })
    expect(res.redirect).toHaveBeenCalledWith(303, nextPageLink)
    expect(next).not.toHaveBeenCalled()
  })
  it('valid value selected, same as previous value, no changes made', async () => {
    // given
    const req = mockReq({
      originalUrl: randomUUID(),
      body: {
        custodyGroup: randomEnum(CUSTODY_GROUP),
      },
    })

    const res = mockRes({
      locals: {
        recommendation: {
          nomisIndexOffence: nomisIndexOffence(),
          bookRecallToPpud: bookRecallToPpud({ custodyGroup: req.body.custodyGroup }),
        },
      },
    })
    const next = mockNext()

    ;(determineErrorId as jest.Mock).mockReturnValue(undefined)

    const nextPagePath: string = 'nextPagePath'
    const nextPageLink: string = 'nextPageLink'
    ;(nextPageLinkUrl as jest.Mock).mockReturnValueOnce(nextPagePath).mockReturnValueOnce(nextPageLink)

    // when
    await editCustodyGroupController.post(req, res, next)

    // then
    expect(determineErrorId).toHaveBeenCalledWith(req.body.custodyGroup, custodyGroupFieldName, validCustodyGroups)
    expect(nextPageLinkUrl).toHaveBeenNthCalledWith(1, {
      nextPageId: 'check-booking-details',
      urlInfo: res.locals.urlInfo,
    })
    expect(nextPageLinkUrl).toHaveBeenNthCalledWith(2, { nextPagePath, urlInfo: res.locals.urlInfo })
    expect(res.redirect).toHaveBeenCalledWith(303, nextPageLink)
    expect(next).not.toHaveBeenCalled()
  })
  it('erroneous custody group value', async () => {
    // given
    const req = mockReq({
      originalUrl: randomUUID(),
      body: {
        custodyGroup: randomUUID(),
      },
    })

    const res = mockRes()
    const next = mockNext()

    const errorId = randomErrorId()
    ;(determineErrorId as jest.Mock).mockReturnValue(errorId)
    ;(reloadPageWithError as jest.Mock).mockReturnValue(undefined)

    // when
    await editCustodyGroupController.post(req, res, next)

    // then
    expect(determineErrorId).toHaveBeenCalledWith(req.body.custodyGroup, custodyGroupFieldName, validCustodyGroups)
    expect(reloadPageWithError).toHaveBeenCalledWith(errorId, 'custodyGroup', req, res)
    expect(next).not.toHaveBeenCalled()
  })
})
