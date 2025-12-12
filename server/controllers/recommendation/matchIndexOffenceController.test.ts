import { fakerEN_GB as faker } from '@faker-js/faker'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, ppudReferenceList, updateRecommendation } from '../../data/makeDecisionApiClient'
import matchIndexOffenceController from './matchIndexOffenceController'
import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'
import { ppcsPaths } from '../../routes/paths/ppcs'
import { isDefined, isEmptyStringOrWhitespace } from '../../utils/utils'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../../utils/utils')

describe('Match Index Offence Controller', () => {
  describe('get', () => {
    const referenceListValues = ['one', 'two', 'three']

    const req = mockReq({
      params: { recommendationId: faker.number.int().toString() },
    })
    const recommendation = RecommendationResponseGenerator.generate()
    const res = mockRes({
      locals: { recommendation },
    })

    const next = mockNext()

    beforeEach(async () => {
      ;(ppudReferenceList as jest.Mock).mockResolvedValue({ values: referenceListValues })
      await matchIndexOffenceController.get(req, res, next)
    })
    it('PPUD Reference list retrieved', () => {
      expect(ppudReferenceList).toHaveBeenCalledWith('token', 'index-offences')
    })
    it('- Calls render for the expected page', async () =>
      expect(res.render).toHaveBeenCalledWith('pages/recommendations/matchIndexOffence'))
    it('- Executes the next function', async () => expect(next).toHaveBeenCalled())
    describe('Res locals:', () => {
      describe('Page:', () => {
        it('Is provided', async () => expect(res.locals.page).toBeDefined())
        it('Correct id', async () => {
          expect(res.locals.page).toBeDefined()
          expect(res.locals.page.id).toEqual('matchIndexOffence')
        })
      })
      describe('Index offences', () => {
        it('Are provided', async () => expect(res.locals.indexOffences).toBeDefined())
        it('Correct values', async () => {
          expect(res.locals.indexOffences).toEqual([
            { text: referenceListValues[0], value: referenceListValues[0] },
            { text: referenceListValues[1], value: referenceListValues[1] },
            { text: referenceListValues[2], value: referenceListValues[2] },
          ])
        })
      })
      describe('Selected NOMIS offence', () => {
        it('Is provided', async () => expect(res.locals.nomisIndexOffence).toBeDefined())
        it('Is correct', async () => {
          const selectedNomisOffenceId = recommendation.nomisIndexOffence.selected
          const expectedOffence = recommendation.nomisIndexOffence.allOptions.find(
            o => o.offenderChargeId === selectedNomisOffenceId
          )
          expect(res.locals.nomisIndexOffence).toEqual(expectedOffence)
        })
      })
    })
  })

  describe('post', () => {
    describe('with valid data', () => {
      const basePath = `/recommendations/1/`
      const req = mockReq({
        params: { recommendationId: '1' },
        body: {
          indexOffence: faker.lorem.sentence(),
          indexOffenceComment: faker.lorem.sentence(),
        },
      })
      const res = mockRes({
        token: 'token1',
        locals: {
          urlInfo: { basePath },
          flags: { xyz: true },
        },
      })
      const next = mockNext()
      const recommendation = RecommendationResponseGenerator.generate()
      describe('with PPUD offender with sentences selected', () => {
        ;[true, false].forEach(hasBlankComment => {
          describe(`with ${hasBlankComment ? 'no ' : ''}index offence comment`, () => {
            beforeEach(async () => {
              ;(isDefined as jest.Mock).mockReturnValue(true)
              ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)
              ;(isEmptyStringOrWhitespace as jest.Mock).mockReturnValue(hasBlankComment)
              ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendation)
              await matchIndexOffenceController.post(req, res, next)
            })
            it('Checks if index offence is defined', () =>
              expect(isDefined).toHaveBeenCalledWith(req.body.indexOffence))
            it('Checks if comment is blank', () =>
              expect(isEmptyStringOrWhitespace).toHaveBeenCalledWith(req.body.indexOffenceComment))
            it('Updates the recommendation as expected', () => {
              expect(updateRecommendation).toHaveBeenCalledWith({
                recommendationId: recommendation.id.toString(),
                valuesToSave: {
                  bookRecallToPpud: {
                    ...recommendation.bookRecallToPpud,
                    indexOffence: req.body.indexOffence,
                    indexOffenceComment: hasBlankComment ? null : req.body.indexOffenceComment,
                  },
                },
                token: res.locals.user.token,
                featureFlags: {
                  xyz: true,
                },
              })
            })
            it('Does not call next function', () => expect(next).not.toHaveBeenCalled())
            it('redirects to Custody Type page', () =>
              expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}${ppcsPaths.editCustodyType}`))
          })
        })
      })
    })

    describe('with invalid data', () => {
      ;[true, false].forEach(indexOffenceDefined => {
        describe(`and index offence ${indexOffenceDefined ? 'defined but blank' : 'not defined'}`, () => {
          const basePath = `/recommendations/1/`
          const req = mockReq({
            originalUrl: 'some-url',
            params: { recommendationId: '1' },
            body: {
              indexOffence: '',
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

          beforeEach(async () => {
            ;(isDefined as jest.Mock).mockReturnValue(indexOffenceDefined)
            await matchIndexOffenceController.post(req, res, next)
          })
          it('Checks if index offence is defined', () => expect(isDefined).toHaveBeenCalledWith(req.body.indexOffence))
          it('Logs expected error', () => {
            expect(req.session.errors).toEqual([
              {
                errorId: 'missingIndexOffence',
                invalidParts: undefined,
                href: '#indexOffence',
                name: 'indexOffence',
                text: 'Select a matching index offence from the list',
                values: undefined,
              },
            ])
          })
          it('Redirects to original URL', () => expect(res.redirect).toHaveBeenCalledWith(303, req.originalUrl))
          it('Does not retrieve recommendation', () => expect(getRecommendation).not.toHaveBeenCalled())
          it('Does not update recommendation', () => expect(updateRecommendation).not.toHaveBeenCalled())
          it('Does not call next function', () => expect(next).not.toHaveBeenCalled())
        })
      })
    })
  })
})
