import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, ppudReferenceList, updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import matchIndexOffenceController from './matchIndexOffenceController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    ;(ppudReferenceList as jest.Mock).mockResolvedValue({ values: ['one', 'two', 'three'] })

    const req = mockReq({
      params: {
        recommendationId: '123',
      },
    })

    const res = mockRes({
      locals: {
        recommendation: {
          nomisIndexOffence: {
            allOptions: [
              {
                bookingId: 13,
                courtDescription: 'Blackburn County Court',
                offenceCode: 'SA96036',
                offenceDescription:
                  'Sing / shout / play a musical instrument / operate a portable music machine cause annoyance at Stansted Airport London',
                offenceStatute: 'SA96',
                offenderChargeId: 3934369,
                sentenceDate: '2023-11-16',
                sentenceEndDate: '3022-11-15',
                sentenceStartDate: '2023-11-16',
                sentenceTypeDescription: 'Adult Mandatory Life',
                terms: [],
                releaseDate: '2025-11-16',
                licenceExpiryDate: '2025-11-17',
                releasingPrison: 'Broad Moor',
              },
            ],
            selected: 3934369,
          },
        },
      },
    })
    const next = mockNext()
    await matchIndexOffenceController.get(req, res, next)

    expect(ppudReferenceList).toHaveBeenCalledWith('token', 'index-offences')

    expect(res.locals.page).toEqual({ id: 'matchIndexOffence' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/matchIndexOffence')
    expect(res.locals.indexOffences).toEqual([
      { text: 'Select an offence', value: '' },
      { text: 'one', value: 'one' },
      { text: 'two', value: 'two' },
      { text: 'three', value: 'three' },
    ])
    expect(next).toHaveBeenCalled()
  })
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
        indexOffence: 'some offence',
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

    await matchIndexOffenceController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookRecallToPpud: {
          policeForce: 'Kent',
          indexOffence: 'some offence',
        },
      },
      token: 'token1',
      featureFlags: {
        xyz: true,
      },
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/sentence-to-commit`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
  it('post with valid data - sentences', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        policeForce: 'Kent',
      },
      ppudOffender: {
        sentences: [{}],
      },
    })
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/1/`
    const req = mockReq({
      params: { recommendationId: '1' },
      body: {
        indexOffence: 'some offence',
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

    await matchIndexOffenceController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookRecallToPpud: {
          policeForce: 'Kent',
          indexOffence: 'some offence',
        },
      },
      token: 'token1',
      featureFlags: {
        xyz: true,
      },
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/select-ppud-sentence`)
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

    await matchIndexOffenceController.post(req, res, next)

    expect(req.session.errors).toEqual([
      {
        errorId: 'missingIndexOffence',
        invalidParts: undefined,
        href: '#indexOffence',
        name: 'indexOffence',
        text: 'Select matching index offence from PPUD',
        values: undefined,
      },
    ])

    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
