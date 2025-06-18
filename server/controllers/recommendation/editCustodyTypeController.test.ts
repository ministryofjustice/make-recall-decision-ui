import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, ppudReferenceList, updateRecommendation } from '../../data/makeDecisionApiClient'
import editCustodyTypeController from './editCustodyTypeController'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { CUSTODY_GROUP } from '../../@types/make-recall-decision-api/models/ppud/CustodyGroup'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load determinate custody types', async () => {
    await testGet(CUSTODY_GROUP.DETERMINATE, 'determinate-custody-types')
  })

  it('load indeterminate custody types', async () => {
    await testGet(CUSTODY_GROUP.INDETERMINATE, 'indeterminate-custody-types')
  })

  async function testGet(custodyGroup: CUSTODY_GROUP, referenceEndpoint: string) {
    ;(ppudReferenceList as jest.Mock).mockResolvedValue({ values: ['one', 'two', 'three'] })

    const req = mockReq({
      params: {
        recommendationId: '123',
      },
    })

    const res = mockRes({
      locals: {
        recommendation: {
          bookRecallToPpud: {
            custodyGroup,
          },
        },
      },
    })
    const next = mockNext()
    await editCustodyTypeController.get(req, res, next)

    expect(ppudReferenceList).toHaveBeenCalledWith('token', referenceEndpoint)

    expect(res.locals.page).toEqual({ id: 'editCustodyType' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/editCustodyType')
    expect(res.locals.custodyTypes).toEqual([
      { text: 'Enter custody type', value: '' },
      { text: 'one', value: 'one' },
      { text: 'two', value: 'two' },
      { text: 'three', value: 'three' },
    ])
    expect(next).toHaveBeenCalled()
  }
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        policeForce: 'Kent',
      },
    })
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/1/`
    const req = mockReq({
      params: { recommendationId: '1' },
      body: {
        custodyType: 'home-bound',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        user: { token: 'token1' },
        urlInfo: { basePath },
        flags: { xyz: true },
      },
    })
    const next = mockNext()

    await editCustodyTypeController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookRecallToPpud: {
          policeForce: 'Kent',
          custodyType: 'home-bound',
        },
      },
      token: 'token1',
      featureFlags: {
        xyz: true,
      },
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/check-booking-details`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
  it('post with invalid data', async () => {
    const basePath = `/recommendations/1/`
    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '1' },
      body: {},
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        user: { token: 'token1' },
        urlInfo: { basePath },
        flags: { xyz: true },
      },
    })
    const next = mockNext()

    await editCustodyTypeController.post(req, res, next)

    expect(req.session.errors).toEqual([
      {
        errorId: 'missingCustodyType',
        invalidParts: undefined,
        href: '#custodyType',
        name: 'custodyType',
        text: 'Enter custody type',
        values: undefined,
      },
    ])

    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
