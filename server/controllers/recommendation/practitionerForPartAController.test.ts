import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import practitionerForPartAController from './practitionerForPartAController'
import { PractitionerForPartA } from '../../@types/make-recall-decision-api/models/RecommendationResponse'
import regionEnum from '../recommendations/formOptions/region'

jest.mock('../../data/makeDecisionApiClient')

describe('Practitioner for Part A Controller', () => {
  ;[true, false].forEach(flagFTR56Enabled => {
    describe(`FTR56 flag ${flagFTR56Enabled ? 'enabled' : 'disabled'}`, () => {
      describe('get', () => {
        it('load with no data', async () => {
          const res = mockRes({
            locals: {
              recommendation: { crn: 'X123' },
              flags: { flagFTR56Enabled },
            },
          })
          const next = mockNext()
          await practitionerForPartAController.get(mockReq(), res, next)

          if (flagFTR56Enabled) {
            expect(res.locals.page).toEqual({ id: 'practitionerForPartAFTR56' })
          } else {
            expect(res.locals.page).toEqual({ id: 'practitionerForPartA' })
          }
          expect(res.locals.inputDisplayValues.name).not.toBeDefined()
          expect(res.locals.inputDisplayValues.email).not.toBeDefined()
          expect(res.locals.inputDisplayValues.telephone).not.toBeDefined()
          expect(res.locals.inputDisplayValues.region).not.toBeDefined()
          expect(res.locals.inputDisplayValues.localDeliveryUnit).not.toBeDefined()
          expect(res.locals.inputDisplayValues.isPersonProbationPractitionerForOffender).not.toBeDefined()
          expect(res.locals.regions).toEqual(regionEnum)
          if (flagFTR56Enabled) {
            expect(res.render).toHaveBeenCalledWith('pages/recommendations/practitionerForPartAFTR56')
          } else {
            expect(res.render).toHaveBeenCalledWith('pages/recommendations/practitionerForPartA')
          }

          expect(next).toHaveBeenCalled()
        })

        it('load with existing data', async () => {
          const practitionerForPartA: PractitionerForPartA = {
            name: 'jane',
            email: 'jane@me.com',
            telephone: '55555',
          }
          if (!flagFTR56Enabled) {
            practitionerForPartA.region = 'region A'
            practitionerForPartA.localDeliveryUnit = 'here'
          }
          const res = mockRes({
            locals: {
              recommendation: {
                practitionerForPartA,
              },
              flags: { flagFTR56Enabled },
            },
          })

          await practitionerForPartAController.get(mockReq(), res, mockNext())

          expect(res.locals.inputDisplayValues.name).toEqual(practitionerForPartA.name)
          expect(res.locals.inputDisplayValues.email).toEqual(practitionerForPartA.email)
          expect(res.locals.inputDisplayValues.telephone).toEqual(practitionerForPartA.telephone)
          if (flagFTR56Enabled) {
            expect(res.locals.inputDisplayValues.region).not.toBeDefined()
            expect(res.locals.inputDisplayValues.localDeliveryUnit).not.toBeDefined()
          } else {
            expect(res.locals.inputDisplayValues.region).toEqual(practitionerForPartA.region)
            expect(res.locals.inputDisplayValues.localDeliveryUnit).toEqual(practitionerForPartA.localDeliveryUnit)
          }
        })

        it('initial load with error data', async () => {
          const practitionerForPartA: PractitionerForPartA = {
            name: 'jane',
            email: 'jane@me.com',
            telephone: '55555',
          }
          const unsavedValues: Record<string, string> = {
            name: 'test',
            email: 'test@here.com',
            telephone: '555555555555',
          }
          if (!flagFTR56Enabled) {
            practitionerForPartA.region = 'region A'
            practitionerForPartA.localDeliveryUnit = 'here'
            unsavedValues.region = 'place B'
            unsavedValues.localDeliveryUnit = 'some place'
          }
          const res = mockRes({
            locals: {
              errors: { val: 'some error' },
              unsavedValues,
              recommendation: {
                practitionerForPartA,
              },
              flags: { flagFTR56Enabled },
            },
          })

          await practitionerForPartAController.get(mockReq(), res, mockNext())

          expect(res.locals.inputDisplayValues.name).toEqual(unsavedValues.name)
          expect(res.locals.inputDisplayValues.email).toEqual(unsavedValues.email)
          expect(res.locals.inputDisplayValues.telephone).toEqual(unsavedValues.telephone)
          if (flagFTR56Enabled) {
            expect(res.locals.inputDisplayValues.region).not.toBeDefined()
            expect(res.locals.inputDisplayValues.localDeliveryUnit).not.toBeDefined()
          } else {
            expect(res.locals.inputDisplayValues.region).toEqual(unsavedValues.region)
            expect(res.locals.inputDisplayValues.localDeliveryUnit).toEqual(unsavedValues.localDeliveryUnit)
          }
          expect(res.locals.errors).toEqual({ val: 'some error' })
        })
      })

      describe('post', () => {
        it('post with valid data', async () => {
          ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

          const basePath = `/recommendations/123/`
          const body: Record<string, string> = {
            name: 'jane',
            email: 'jane@test.gov.uk',
            telephone: '5555555',
          }
          if (!flagFTR56Enabled) {
            body.region = 'region C'
            body.localDeliveryUnit = 'place A'
          }
          const req = mockReq({
            params: { recommendationId: '123' },
            body,
          })

          const res = mockRes({
            token: 'token1',
            locals: {
              recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
              urlInfo: { basePath },
              flags: { flagFTR56Enabled },
            },
          })
          const next = mockNext()

          await practitionerForPartAController.post(req, res, next)

          expect(updateRecommendation).toHaveBeenCalledWith({
            recommendationId: '123',
            token: 'token1',
            valuesToSave: {
              practitionerForPartA: {
                name: body.name,
                email: body.email,
                telephone: body.telephone,
                region: flagFTR56Enabled ? undefined : body.region,
                localDeliveryUnit: flagFTR56Enabled ? undefined : body.localDeliveryUnit,
              },
            },
            featureFlags: { flagFTR56Enabled },
          })

          expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list`)
          expect(next).not.toHaveBeenCalled()
        })

        it('post with invalid data', async () => {
          ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

          const req = mockReq({
            originalUrl: 'some-url',
            params: { recommendationId: '123' },
            body: {
              name: undefined,
              email: undefined,
              telephone: undefined,
              region: undefined,
              localDeliveryUnit: undefined,
            },
          })

          const res = mockRes({
            locals: {
              user: { token: 'token1' },
              recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
              urlInfo: { basePath: `/recommendations/123/` },
              flags: { flagFTR56Enabled },
            },
          })

          await practitionerForPartAController.post(req, res, mockNext())

          expect(updateRecommendation).not.toHaveBeenCalled()
          expect(req.session.errors).toEqual([
            {
              errorId: 'missingPractitionerForPartAName',
              href: '#name',
              invalidParts: undefined,
              name: 'name',
              text: 'Enter the name of the probation practitioner for {{ fullName }}',
              values: undefined,
            },
            {
              errorId: 'missingPractitionerForPartAEmail',
              href: '#email',
              invalidParts: undefined,
              name: 'email',
              text: 'Enter the GOV.UK email for the probation practitioner for {{ fullName }}',
              values: undefined,
            },
          ])
          expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
        })

        it('post with invalid email', async () => {
          ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

          const req = mockReq({
            originalUrl: 'some-url',
            params: { recommendationId: '123' },
            body: {
              name: 'jane',
              email: 'doe',
              telephone: '5555555',
              region: flagFTR56Enabled ? undefined : 'region C',
              localDeliveryUnit: flagFTR56Enabled ? undefined : 'place A',
            },
          })

          const res = mockRes({
            locals: {
              user: { token: 'token1' },
              recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
              urlInfo: { basePath: `/recommendations/123/` },
              flags: { flagFTR56Enabled },
            },
          })

          await practitionerForPartAController.post(req, res, mockNext())

          expect(updateRecommendation).not.toHaveBeenCalled()
          expect(req.session.errors).toEqual([
            {
              errorId: 'invalidPractitionerForPartAEmail',
              href: '#email',
              invalidParts: undefined,
              name: 'email',
              text: 'Enter the email in the correct format, like name@justice.gov.uk',
              values: undefined,
            },
          ])
          expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
        })

        it('post with valid but non gov.uk email', async () => {
          ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

          const req = mockReq({
            originalUrl: 'some-url',
            params: { recommendationId: '123' },
            body: {
              name: 'jane',
              email: 'test@non.govuk.email.com',
              telephone: '5555555',
              region: flagFTR56Enabled ? undefined : 'region C',
              localDeliveryUnit: flagFTR56Enabled ? undefined : 'place A',
            },
          })

          const res = mockRes({
            locals: {
              user: { token: 'token1' },
              recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
              urlInfo: { basePath: `/recommendations/123/` },
              flags: { flagFTR56Enabled },
            },
          })

          await practitionerForPartAController.post(req, res, mockNext())

          expect(updateRecommendation).not.toHaveBeenCalled()
          expect(req.session.errors).toEqual([
            {
              errorId: 'nonGovUkPractitionerForPartAEmail',
              href: '#email',
              invalidParts: undefined,
              name: 'email',
              text: 'You can only use an email ending in ‘GOV.UK’ for the probation practitioner for {{ fullName }}',
              values: undefined,
            },
          ])
          expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
        })
      })
    })
  })
})
