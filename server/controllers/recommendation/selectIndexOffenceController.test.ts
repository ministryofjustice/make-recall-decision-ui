import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, prisonSentences, updateRecommendation } from '../../data/makeDecisionApiClient'
import selectIndexOffenceController from './selectIndexOffenceController'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    ;(prisonSentences as jest.Mock).mockResolvedValue([
      {
        bookingId: 13,
        sentenceSequence: 4,
        lineSequence: 4,
        caseSequence: 2,
        courtDescription: 'Blackburn County Court',
        sentenceStatus: 'A',
        sentenceCategory: '2003',
        sentenceCalculationType: 'MLP',
        sentenceTypeDescription: 'Adult Mandatory Life',
        sentenceDate: '2023-11-16',
        sentenceStartDate: '2023-11-16',
        sentenceEndDate: '3022-11-15',
        releaseDate: '2025-11-16',
        licenceExpiryDate: '2025-11-17',
        releasingPrison: 'Broad Moor',
        terms: [],
        offences: [
          {
            offenderChargeId: 3934369,
            offenceStartDate: '1899-01-01',
            offenceStatute: 'SA96',
            offenceCode: 'SA96036',
            offenceDescription:
              'Sing / shout / play a musical instrument / operate a portable music machine cause annoyance at Stansted Airport London',
            indicators: [],
          },
        ],
      },
    ])

    const req = mockReq({
      params: { recommendationId: '123' },
    })

    const res = mockRes({
      locals: {
        recommendation: {
          id: '123',
          convictionDetail: { sentenceDescription: 'sentence' },
          personOnProbation: {
            croNumber: '123X',
            nomsNumber: '567Y',
            surname: 'Mayer',
            dateOfBirth: '2001-01-01',
            mappa: {
              level: '1',
            },
          },
        },
      },
    })
    const next = mockNext()

    await selectIndexOffenceController.get(req, res, next)

    expect(prisonSentences).toHaveBeenCalledWith('token', '567Y')

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: {},
      recommendationId: '123',
      token: 'token',
      valuesToSave: {
        nomisIndexOffence: {
          allOptions: [
            {
              bookingId: 13,
              courtDescription: 'Blackburn County Court',
              offenceCode: 'SA96036',
              offenceDate: '1899-01-01',
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
          selected: undefined,
        },
      },
    })

    expect(res.locals.page.id).toEqual('selectIndexOffence')
    expect(res.locals.sentences).toEqual([
      {
        bookingId: 13,
        sentenceSequence: 4,
        lineSequence: 4,
        caseSequence: 2,
        courtDescription: 'Blackburn County Court',
        sentenceStatus: 'A',
        sentenceCategory: '2003',
        sentenceCalculationType: 'MLP',
        sentenceTypeDescription: 'Adult Mandatory Life',
        sentenceDate: '2023-11-16',
        sentenceStartDate: '2023-11-16',
        sentenceEndDate: '3022-11-15',
        licenceExpiryDate: '2025-11-17',
        releasingPrison: 'Broad Moor',
        releaseDate: '2025-11-16',
        terms: [],
        offences: [
          {
            offenderChargeId: 3934369,
            offenceStartDate: '1899-01-01',
            offenceStatute: 'SA96',
            offenceCode: 'SA96036',
            offenceDescription:
              'Sing / shout / play a musical instrument / operate a portable music machine cause annoyance at Stansted Airport London',
            indicators: [],
          },
        ],
      },
    ])
    expect(res.locals.errorMessage).toBeUndefined()
    expect(res.render).toHaveBeenCalledWith(`pages/recommendations/selectIndexOffence`)
    expect(next).toHaveBeenCalled()
  })
  it('load with no sentences', async () => {
    ;(prisonSentences as jest.Mock).mockResolvedValue(undefined)

    const res = mockRes({
      locals: {
        recommendation: {
          convictionDetail: { sentenceDescription: undefined },
          id: '123',
          personOnProbation: {
            nomsNumber: '567Y',
          },
        },
      },
    })
    const next = mockNext()

    await selectIndexOffenceController.get(mockReq(), res, next)

    expect(prisonSentences).toHaveBeenCalledWith('token', '567Y')
    expect(res.locals.page.id).toEqual('selectIndexOffence')
    expect(res.locals.sentences).toEqual([])
    expect(res.locals.errorMessage).toBe('No sentences found')
    expect(res.render).toHaveBeenCalledWith(`pages/recommendations/selectIndexOffence`)
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('select index offence', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      nomisIndexOffence: {
        allOptions: [
          {
            offenderChargeId: 1234,
            releaseDate: '2039-12-01',
            sentenceDate: '2019-01-20',
          },
        ],
      },
      bookRecallToPpud: {
        mappaLevel: 'Mappa Level 1',
      },
    })
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: { indexOffence: '1234' },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    const next = mockNext()

    await selectIndexOffenceController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: {},
      recommendationId: '123',
      token: 'token',
      valuesToSave: {
        nomisIndexOffence: {
          allOptions: [
            {
              offenderChargeId: 1234,
              releaseDate: '2039-12-01',
              sentenceDate: '2019-01-20',
            },
          ],
          selected: '1234',
        },
        bookRecallToPpud: {
          mappaLevel: 'Mappa Level 1',
          releaseDate: '2039-12-01',
          sentenceDate: '2019-01-20',
        },
      },
    })
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/index-offence-selected`)
    expect(next).toHaveBeenCalled()
  })
  it('missing index offence', async () => {
    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {},
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    const next = mockNext()

    await selectIndexOffenceController.post(req, res, next)
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)

    expect(req.session.errors).toEqual([
      {
        errorId: 'noIndexOffenceSelected',
        href: '#indexOffence',
        invalidParts: undefined,
        name: 'indexOffence',
        text: 'You must select an index offence',
        values: undefined,
      },
    ])
    expect(next).not.toHaveBeenCalled()
  })
})
