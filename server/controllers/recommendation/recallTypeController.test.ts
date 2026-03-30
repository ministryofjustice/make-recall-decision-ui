import { faker } from '@faker-js/faker'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import recallTypeController from './recallTypeController'
import { updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import inputDisplayValuesRecallType from '../recommendations/recallType/inputDisplayValues'
import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'
import validateRecallType from '../recommendations/recallType/formValidator'
import { formOptions } from '../recommendations/formOptions/formOptions'
import EVENTS from '../../utils/constants'
import {
  availableRecallTypesForRecommendation,
  availableRecallTypesForRecommendationFTR56,
} from '../recommendations/recallType/availableRecallTypes'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import {
  isFixedTermRecallMandatoryForRecommendation,
  isStandardRecallMandatoryForRecommendationFTR56,
} from '../../utils/fixedTermRecallUtils'

jest.mock('../../monitoring/azureAppInsights')
jest.mock('../../data/makeDecisionApiClient')
jest.mock('../recommendations/recallType/availableRecallTypes')
jest.mock('../recommendations/recallType/inputDisplayValues')
jest.mock('../recommendations/recallType/formValidator')
jest.mock('../../utils/fixedTermRecallUtils')

describe('get', () => {
  ;[true, false].forEach(flagFTR56Enabled => {
    describe(`with FTR56 flag ${flagFTR56Enabled ? 'enabled' : 'disabled'}`, () => {
      const locals = {
        token: 'token1',
        recommendation: RecommendationResponseGenerator.generate(),
        unsavedValues: { recallType: 'STANDARD' },
        errors: {
          list: [
            {
              name: 'recallTypeDetailsStandard',
              href: '#recallTypeDetailsStandard',
              errorId: 'missingRecallTypeDetail',
              html: 'Explain why you recommend this recall type',
            },
          ],
          recallTypeDetailsStandard: {
            text: 'Explain why you recommend this recall type',
            href: '#recallTypeDetailsStandard',
            errorId: 'missingRecallTypeDetail',
          },
        },
        flags: { flagFTR56Enabled },
      }
      const next = mockNext()

      const inputDisplayValues = { value: faker.string.alpha(), details: faker.lorem.text() }

      const res = mockRes({ locals })

      const expectedAvailableRecallTypes = faker.helpers.arrayElements(formOptions.recallType)
      const isFTRMandatory = faker.datatype.boolean()
      const isStandardMandatory = faker.datatype.boolean()
      beforeEach(async () => {
        ;(inputDisplayValuesRecallType as jest.Mock).mockReturnValueOnce(inputDisplayValues)
        ;(isFixedTermRecallMandatoryForRecommendation as jest.Mock).mockReturnValueOnce(isFTRMandatory)
        if (flagFTR56Enabled) {
          ;(availableRecallTypesForRecommendationFTR56 as jest.Mock).mockReturnValueOnce(expectedAvailableRecallTypes)
          ;(isStandardRecallMandatoryForRecommendationFTR56 as jest.Mock).mockReturnValueOnce(isStandardMandatory)
        } else {
          ;(availableRecallTypesForRecommendation as jest.Mock).mockReturnValueOnce(expectedAvailableRecallTypes)
        }
        recallTypeController.get(mockReq(), res, next)
      })

      it('adds correct page to res.locals', async () => {
        expect(res.locals.page).toEqual({ id: 'recallType' })
      })
      it('adds result of inputDisplayValuesRecallType to res.locals', async () => {
        expect(res.locals.inputDisplayValues).toEqual(inputDisplayValues)
        expect(inputDisplayValuesRecallType).toHaveBeenCalledWith({
          errors: res.locals.errors,
          unsavedValues: res.locals.unsavedValues,
          apiValues: res.locals.recommendation,
        })
      })
      it('adds result of availableRecallTypes to res.locals', async () => {
        expect(res.locals.availableRecallTypes).toEqual(expectedAvailableRecallTypes)
        if (flagFTR56Enabled) {
          expect(availableRecallTypesForRecommendationFTR56).toHaveBeenCalledWith(res.locals.recommendation)
        } else {
          expect(availableRecallTypesForRecommendation).toHaveBeenCalledWith(res.locals.recommendation)
        }
      })
      it("adds PoP's name to res.locals", async () => {
        expect(res.locals.personOnProbationName).toEqual(
          (locals.recommendation as RecommendationResponse)?.personOnProbation?.fullName,
        )
      })
      it(`adds result of isFixedTermRecallMandatoryForRecommendation${flagFTR56Enabled ? 'FTR56' : ''} to res.locals`, async () => {
        expect(res.locals.ftrMandatory).toEqual(isFTRMandatory)
        expect(isFixedTermRecallMandatoryForRecommendation).toHaveBeenCalledWith(
          res.locals.recommendation,
          flagFTR56Enabled,
        )
      })
      if (flagFTR56Enabled) {
        it(`adds result of isStandardRecallMandatoryForRecommendationFTR56 to res.locals`, async () => {
          expect(res.locals.standardMandatory).toEqual(isStandardMandatory)
          expect(isStandardRecallMandatoryForRecommendationFTR56).toHaveBeenCalledWith(res.locals.recommendation)
        })
        it(`adds isAdultSentence to res.locals`, async () => {
          expect(res.locals.isAdultSentence).toEqual(res.locals.recommendation.sentenceGroup === 'ADULT_SDS')
        })
      }
      it('renders the recallType page and calls next', async () => {
        expect(res.render).toHaveBeenCalledWith('pages/recommendations/recallType')
        expect(next).toHaveBeenCalled()
      })
    })
  })
})

describe('post', () => {
  ;[true, false].forEach(flagFTR56Enabled => {
    describe(`with FTR56 flag ${flagFTR56Enabled ? 'enabled' : 'disabled'}`, () => {
      it('post with valid data - recall', async () => {
        ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

        const basePath = `/recommendations/123/`
        const req = mockReq({
          params: { recommendationId: '123' },
          body: {
            crn: 'X098092',
            recallType: 'STANDARD',
            recallTypeDetailsStandard: 'some details',
          },
        })

        const res = mockRes({
          token: 'token1',
          locals: {
            user: { token: 'token1', username: 'Dave', region: { code: 'N07', name: 'London' } },
            urlInfo: { basePath },
            flags: { flagFTR56Enabled },
          },
        })
        const next = mockNext()

        const validationResults = {
          valuesToSave: {
            recallType: {
              selected: {
                value: req.body.recallType,
                details: req.body.recallTypeDetailsStandard,
              },
              allOptions: formOptions.recallType,
            },
            isThisAnEmergencyRecall: false,
          },
          nextPagePath: faker.internet.url(),
          monitoringEvent: {
            eventName: EVENTS.MRD_RECALL_TYPE,
            data: {
              recallType: req.body.recallType,
            },
          },
        }
        ;(validateRecallType as jest.Mock).mockResolvedValue(validationResults)

        await recallTypeController.post(req, res, next)

        expect(validateRecallType).toHaveBeenCalledWith({
          requestBody: req.body,
          recommendationId: req.params.recommendationId,
          urlInfo: res.locals.urlInfo,
          token: res.locals.user.token,
          flagFTR56Enabled,
        })

        expect(updateStatuses).toHaveBeenCalledWith({
          recommendationId: req.params.recommendationId,
          token: res.locals.user.token,
          activate: [STATUSES.RECALL_DECIDED],
          deActivate: [STATUSES.NO_RECALL_DECIDED],
        })

        expect(updateRecommendation).toHaveBeenCalledWith({
          recommendationId: req.params.recommendationId,
          token: res.locals.user.token,
          valuesToSave: validationResults.valuesToSave,
          featureFlags: res.locals.flags,
        })

        expect(appInsightsEvent).toHaveBeenCalledWith(
          validationResults.monitoringEvent.eventName,
          res.locals.user.username,
          {
            crn: req.body.crn,
            recallType: validationResults.monitoringEvent.data.recallType,
            recommendationId: req.params.recommendationId,
            region: { code: res.locals.user.region.code, name: res.locals.user.region.name },
          },
          res.locals.flags,
        )

        expect(res.redirect).toHaveBeenCalledWith(303, validationResults.nextPagePath)
        expect(next).not.toHaveBeenCalled() // end of the line for posts.
      })

      it('post with valid data - no recall', async () => {
        ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

        const basePath = `/recommendations/123/`
        const req = mockReq({
          params: { recommendationId: '123' },
          body: {
            crn: 'X098092',
            recallType: 'NO_RECALL',
          },
        })

        const res = mockRes({
          token: 'token1',
          locals: {
            user: { token: 'token1', username: 'Dave', region: { code: 'N07', name: 'London' } },
            urlInfo: { basePath },
            flags: { flagFTR56Enabled },
          },
        })
        const next = mockNext()

        const validationResults = {
          valuesToSave: {
            recallType: {
              selected: {
                value: req.body.recallType,
                details: req.body.recallTypeDetailsStandard,
              },
              allOptions: formOptions.recallType,
            },
            isThisAnEmergencyRecall: false,
          },
          nextPagePath: faker.internet.url(),
          monitoringEvent: {
            eventName: EVENTS.MRD_RECALL_TYPE,
            data: {
              recallType: req.body.recallType,
            },
          },
        }
        ;(validateRecallType as jest.Mock).mockResolvedValue(validationResults)

        await recallTypeController.post(req, res, next)

        expect(validateRecallType).toHaveBeenCalledWith({
          requestBody: req.body,
          recommendationId: req.params.recommendationId,
          urlInfo: res.locals.urlInfo,
          token: res.locals.user.token,
          flagFTR56Enabled,
        })

        expect(updateStatuses).toHaveBeenCalledWith({
          recommendationId: req.params.recommendationId,
          token: res.locals.user.token,
          activate: [STATUSES.NO_RECALL_DECIDED],
          deActivate: [STATUSES.RECALL_DECIDED],
        })

        expect(updateRecommendation).toHaveBeenCalledWith({
          recommendationId: req.params.recommendationId,
          token: res.locals.user.token,
          valuesToSave: validationResults.valuesToSave,
          featureFlags: res.locals.flags,
        })

        expect(appInsightsEvent).toHaveBeenCalledWith(
          validationResults.monitoringEvent.eventName,
          res.locals.user.username,
          {
            crn: req.body.crn,
            recallType: validationResults.monitoringEvent.data.recallType,
            recommendationId: req.params.recommendationId,
            region: { code: res.locals.user.region.code, name: res.locals.user.region.name },
          },
          res.locals.flags,
        )

        expect(res.redirect).toHaveBeenCalledWith(303, validationResults.nextPagePath)
        expect(next).not.toHaveBeenCalled() // end of the line for posts.
      })

      it('post with invalid data', async () => {
        ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

        const req = mockReq({
          originalUrl: 'some-url',
          params: { recommendationId: '123' },
          body: {
            crn: 'X098092',
            recallType: 'FIXED_TERM',
            recallTypeDetailsFixedTerm: '',
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

        const validationResults = {
          errors: [
            {
              errorId: 'missingRecallTypeDetail',
              href: '#recallTypeDetailsFixedTerm',
              text: 'Explain why you recommend this recall type',
              name: 'recallTypeDetailsFixedTerm',
            },
          ],
          unsavedValues: faker.lorem.word(),
        }
        ;(validateRecallType as jest.Mock).mockResolvedValue(validationResults)

        await recallTypeController.post(req, res, mockNext())

        expect(validateRecallType).toHaveBeenCalledWith({
          requestBody: req.body,
          recommendationId: req.params.recommendationId,
          urlInfo: res.locals.urlInfo,
          token: res.locals.user.token,
          flagFTR56Enabled,
        })

        expect(updateRecommendation).not.toHaveBeenCalled()
        expect(req.session).toEqual({
          errors: validationResults.errors,
          unsavedValues: validationResults.unsavedValues,
        })
        expect(res.redirect).toHaveBeenCalledWith(303, req.originalUrl)
      })
    })
  })
})
