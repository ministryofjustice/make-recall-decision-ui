import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import selectPpudSentenceController from './selectPpudSentenceController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          id: '123',
          nomisIndexOffence: {
            selected: 1,
            allOptions: [
              {
                offenderChargeId: 1,
              },
            ],
          },
        },
      },
    })
    const next = mockNext()

    await selectPpudSentenceController.get(mockReq(), res, next)

    expect(res.locals.page.id).toEqual('selectPpudSentence')
    expect(res.locals.offence).toEqual({ offenderChargeId: 1 })
    expect(res.render).toHaveBeenCalledWith(`pages/recommendations/selectPpudSentence`)
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('select ppud sentence', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        mappaLevel: 'Mappa Level 1',
      },
    })

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: { ppudSentenceId: '1234' },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    const next = mockNext()

    await selectPpudSentenceController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: {},
      recommendationId: '123',
      token: 'token',
      valuesToSave: {
        bookRecallToPpud: {
          mappaLevel: 'Mappa Level 1',
          ppudSentenceId: '1234',
        },
      },
    })
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/sentence-to-commit-existing-offender`)
    expect(next).toHaveBeenCalled()
  })
  it('select add new ppud sentence', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        mappaLevel: 'Mappa Level 1',
      },
    })

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: { ppudSentenceId: 'ADD_NEW' },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    const next = mockNext()

    await selectPpudSentenceController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: {},
      recommendationId: '123',
      token: 'token',
      valuesToSave: {
        bookRecallToPpud: {
          mappaLevel: 'Mappa Level 1',
          ppudSentenceId: 'ADD_NEW',
        },
      },
    })
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/custody-type`)
    expect(next).toHaveBeenCalled()
  })
  it('missing ppud sentence', async () => {
    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {},
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    const next = mockNext()

    await selectPpudSentenceController.post(req, res, next)
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)

    expect(req.session.errors).toEqual([
      {
        errorId: 'noPpudSentenceSelected',
        href: '#ppudSentenceId',
        invalidParts: undefined,
        name: 'ppudSentenceId',
        text: 'Select an existing sentence or add a new one',
        values: undefined,
      },
    ])
    expect(next).not.toHaveBeenCalled()
  })
})
