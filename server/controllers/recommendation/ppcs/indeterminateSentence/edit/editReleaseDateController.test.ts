import { fakerEN_GB as faker } from '@faker-js/faker/'
import { DateTime } from 'luxon'
import { mockNext, mockReq, mockRes } from '../../../../../middleware/testutils/mockRequestUtils'
import editReleaseDateController from './editReleaseDateController'
import { updateRecommendation } from '../../../../../data/makeDecisionApiClient'
import { RecommendationResponseGenerator } from '../../../../../../data/recommendations/recommendationGenerator'

jest.mock('../../../../../data/makeDecisionApiClient')

const expected = {
  basePath: `/recommendations/${faker.number.int()}/`,
  render: {
    path: 'pages/recommendations/ppcs/indeterminateSentence/edit/editReleaseDate',
  },
}

describe('Indeterminate Sentence - Edit Release Date Controller', () => {
  const sentenceId = faker.number.int().toString()
  const originalReleaseDate = faker.date.past()
  const recommendation = RecommendationResponseGenerator.generate({
    bookRecallToPpud: {
      ppudSentenceId: sentenceId,
      ppudSentenceData: {},
    },
    ppudOffender: {
      sentences: [
        {
          id: sentenceId,
          releaseDate: originalReleaseDate,
        },
      ],
    },
  })
  const expectedReleaseDate = new Date(recommendation.bookRecallToPpud.ppudSentenceData.releaseDate)

  describe('get', () => {
    const req = mockReq()
    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()
    beforeEach(async () => {
      await editReleaseDateController.get(req, res, next)
    })

    describe('Sets response locals correctly:', () => {
      describe('Page Data', () => {
        it('- is defined', async () => expect(res.locals.pageData).toBeDefined())
        it('- Existing release date', async () =>
          expect(res.locals.pageData.existingReleaseDate).toEqual(originalReleaseDate.toISOString()))
        it('- Day value to edit', async () => expect(res.locals.pageData.day).toEqual(expectedReleaseDate.getDate()))
        it('- Month value to edit', async () =>
          expect(res.locals.pageData.month).toEqual(expectedReleaseDate.getMonth() + 1))
        it('- Year value to edit', async () =>
          expect(res.locals.pageData.year).toEqual(expectedReleaseDate.getFullYear()))
      })
    })
    it('Does not set any error message', async () => expect(res.locals.errorMessage).toBeUndefined())
    it('Calls render to for the expected page', async () =>
      expect(res.render).toHaveBeenCalledWith(expected.render.path))
    it('Executes the next function ', async () => expect(next).toHaveBeenCalled())
  })

  describe('post', () => {
    const recommendationId = faker.number.int().toString()
    const basePath = `/recommendations/${faker.number.int()}/`
    const next = mockNext()
    const validDate = DateTime.now().minus({ days: 1 })
    const expectedDateParts = {
      day: validDate.day.toString().padStart(2, '0'),
      month: validDate.month.toString().padStart(2, '0'),
      year: validDate.year.toString(),
    }

    const validReq = mockReq({
      params: { recommendationId },
      body: expectedDateParts,
    })
    const res = mockRes({
      locals: {
        recommendation,
        urlInfo: { basePath },
      },
    })

    describe('Given a valid date is submitted', () => {
      beforeEach(async () => {
        await editReleaseDateController.post(validReq, res, next)
      })

      it('Then there are no errors', async () => expect(validReq.session.errors).toBeUndefined())
      it('Then the recommendation is updated with the expected details', async () =>
        expect(updateRecommendation).toHaveBeenCalledWith({
          recommendationId,
          valuesToSave: {
            bookRecallToPpud: {
              ...recommendation.bookRecallToPpud,
              ppudSentenceData: {
                ...recommendation.bookRecallToPpud.ppudSentenceData,
                releaseDate: `${expectedDateParts.year}-${expectedDateParts.month}-${expectedDateParts.day}`,
              },
            },
          },
          featureFlags: res.locals.flags,
          token: res.locals.user.token,
        }))
      it('Then it redirects to the Sentence to Commit (Indeterminate page)', async () =>
        expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}sentence-to-commit-indeterminate`))
      it('Does not execute the next function ', async () => expect(next).not.toHaveBeenCalled())
    })
    describe('Given an invalid date is submitted', () => {
      type DateKey = 'day' | 'month' | 'year'
      const variableShortYear = faker.helpers.arrayElement([1, 12, 123])
      const futureDate = DateTime.now().plus({ days: faker.number.int({ min: 1, max: 6 }) })
      const invalidDateTestCases: {
        name: string
        testBody: { day: number; month: number; year: number }
        id: DateKey
        parts: DateKey[]
      }[] = [
        {
          name: 'Blank Date',
          testBody: { day: undefined, month: undefined, year: undefined },
          id: 'day',
          parts: ['day', 'month', 'year'],
        },
        {
          name: `Year too short: '${variableShortYear}'`,
          testBody: { day: 1, month: 1, year: variableShortYear },
          id: 'year',
          parts: ['year'],
        },
        { name: 'Day less than minimum', testBody: { day: 0, month: 1, year: 2025 }, id: 'day', parts: ['day'] },
        {
          name: 'Day greater than maximum',
          testBody: { day: faker.number.int({ min: 32 }), month: 1, year: 2025 },
          id: 'day',
          parts: ['day'],
        },
        { name: 'Month less than minimum', testBody: { day: 1, month: 0, year: 2025 }, id: 'month', parts: ['month'] },
        {
          name: 'Month greater than maximum',
          testBody: { day: 1, month: faker.number.int({ min: 13 }), year: 2025 },
          id: 'month',
          parts: ['month'],
        },
        {
          name: 'Year less than minimum',
          testBody: { day: 1, month: 1, year: faker.number.int({ max: 1899 }) },
          id: 'year',
          parts: ['year'],
        },
        {
          name: 'Year greater than maximum',
          testBody: { day: 1, month: 1, year: faker.number.int({ min: 2201 }) },
          id: 'year',
          parts: ['year'],
        },
        { name: 'Not a real date', testBody: { day: 31, month: 2, year: 2025 }, id: 'day', parts: undefined },
        {
          name: 'Date is in the future',
          testBody: { day: futureDate.day, month: futureDate.month, year: futureDate.year },
          id: 'day',
          parts: ['day', 'month', 'year'],
        },
      ]
      invalidDateTestCases.forEach(({ name, testBody, id, parts }) => {
        const invalidReq = mockReq({
          body: {
            day: testBody.day?.toString(),
            month: testBody.month?.toString(),
            year: testBody.year?.toString(),
          },
          originalUrl: faker.internet.url(),
        })
        beforeEach(async () => {
          await editReleaseDateController.post(invalidReq, res, next)
        })
        describe(`- ${name}`, () => {
          it('Then there is an error defined', async () => expect(invalidReq.session.errors).toBeDefined())
          describe('Error details', () => {
            const releaseDateName = 'releaseDate'
            it(`- Contains an error for ${releaseDateName}`, async () =>
              expect(invalidReq.session.errors?.some(e => e.name === releaseDateName)).toBeTruthy())
            const getError = () => invalidReq.session.errors.find(e => e.name === releaseDateName)
            it('- Is supplied with an error message', async () => expect(getError().text).toBeDefined())
            it(`- Has the expected invalid part id: ${releaseDateName}-${id}`, async () =>
              expect(getError().href).toEqual(`#${releaseDateName}-${id}`))
            it(`- Has the expected invalid parts for error formatting: ${parts}`, async () =>
              expect(getError().invalidParts).toEqual(parts))
            it('- Does not update the recommendation', async () => expect(updateRecommendation).not.toHaveBeenCalled())
          })
          it('- Redirects to back to the original url', async () =>
            expect(res.redirect).toHaveBeenCalledWith(303, invalidReq.originalUrl))
          it('- Does not execute the next function ', async () => expect(next).not.toHaveBeenCalled())
        })
      })
    })
  })
})
